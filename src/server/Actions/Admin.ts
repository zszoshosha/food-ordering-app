"use server";

import { db, withPrismaRetry } from "../../lib/prisma";
import { authOptions } from "../auth";
import {
  AdminOrderListItem,
  AdminOrderStatus,
  AdminOverview,
  AdminProductInput,
  AdminUserListItem,
  PaginatedResult,
  PaginationQuery,
} from "../../types/admin";
import {
  isValidOrderTransition,
  OrderStatus,
} from "../../lib/order-state-machine";
import {
  ActionResponse,
  actionError,
  actionSuccess,
} from "../../types/action-response";
import {
  adminOrdersQuerySchema,
  adminOrderStatusSchema,
  adminProductIdSchema,
  adminProductSchema,
  adminUsersQuerySchema,
} from "../../validation/admin";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";
import * as z from "zod";
import {
  CATEGORY_CACHE_TAG,
  MENU_CACHE_TAG,
} from "../../server/db/product";

type AdminOrderQuery = PaginationQuery & {
  status?: string;
};

type AdminUsersQuery = PaginationQuery & {
  role?: string;
};

const toValidationErrors = (
  fieldErrors: Record<string, string[] | undefined>,
) => {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
      Boolean(entry[1]?.length),
    ),
  );
};

const requireAdminSession = async (): Promise<
  ActionResponse<{ userId: string }>
> => {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id || user.role !== "ADMIN") {
    return actionError("Unauthorized");
  }

  return actionSuccess({ userId: user.id });
};

const revalidatePublicMenuCache = () => {
  revalidateTag(MENU_CACHE_TAG, "max");
  revalidateTag(CATEGORY_CACHE_TAG, "max");
};

const validateProductId = (productId: string) => {
  const parsed = adminProductIdSchema.safeParse({ productId });
  if (!parsed.success) {
    return actionError(
      "Invalid product id.",
      toValidationErrors(parsed.error.flatten().fieldErrors),
    );
  }

  return actionSuccess(parsed.data.productId);
};

export const getAdminOverview = async (): Promise<
  ActionResponse<AdminOverview>
> => {
  const auth = await requireAdminSession();
  if (!auth.success) {
    return auth;
  }

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      activeDeliveryOrders,
      totalUsers,
      deliveryUsers,
      totalProducts,
      revenueAgg,
      todayRevenueAgg,
    ] = await Promise.all([
      withPrismaRetry(() => db.order.count()),
      withPrismaRetry(() => db.order.count({ where: { status: 0 } })),
      withPrismaRetry(() =>
        db.order.count({ where: { status: OrderStatus.OUT_FOR_DELIVERY } }),
      ),
      withPrismaRetry(() => db.user.count()),
      withPrismaRetry(() =>
        db.user.count({ where: { role: UserRole.DELIVERY } }),
      ),
      withPrismaRetry(() => db.product.count()),
      withPrismaRetry(() =>
        db.order.aggregate({
          _sum: { total: true },
        }),
      ),
      withPrismaRetry(() =>
        db.order.aggregate({
          where: { createdAt: { gte: startOfDay } },
          _sum: { total: true },
        }),
      ),
    ]);

    return actionSuccess({
      totalRevenue: Number(revenueAgg._sum.total ?? 0),
      todayRevenue: Number(todayRevenueAgg._sum.total ?? 0),
      totalOrders,
      pendingOrders,
      activeDeliveryOrders,
      totalUsers,
      deliveryUsers,
      totalProducts,
    });
  } catch {
    return actionError("Failed to load admin overview.");
  }
};

export const getAdminProducts = async (): Promise<
  ActionResponse<unknown[]>
> => {
  const auth = await requireAdminSession();
  if (!auth.success) {
    return auth;
  }

  try {
    const products = await withPrismaRetry(() =>
      db.product.findMany({
        include: { sizes: true, extras: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    );

    return actionSuccess(products);
  } catch {
    return actionError("Failed to fetch products.");
  }
};

export const createAdminProduct = async (
  payload: AdminProductInput,
  locale: string,
): Promise<ActionResponse<unknown>> => {
  const auth = await requireAdminSession();
  if (!auth.success) {
    return auth;
  }

  const parsed = adminProductSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError(
      "Invalid product payload.",
      toValidationErrors(parsed.error.flatten().fieldErrors),
    );
  }

  try {
    const existingProduct = await withPrismaRetry(() =>
      db.product.findFirst({
        where: { name: parsed.data.name },
        select: { id: true },
      }),
    );

    if (existingProduct) {
      const duplicateMessage =
        locale === "ar"
          ? "هذا الاسم موجود بالفعل"
          : "This product name already exists.";

      return actionError(duplicateMessage, {
        name: [duplicateMessage],
      });
    }

    const maxOrder = await withPrismaRetry(() =>
      db.product.aggregate({
        _max: { order: true },
      }),
    );

    const created = await withPrismaRetry(() =>
      db.product.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          image: parsed.data.image,
          basePrice: parsed.data.basePrice,
          category: parsed.data.category,
          order: parsed.data.order ?? (maxOrder._max.order ?? 0) + 1,
          sizes: {
            create: parsed.data.sizes.map((size) => ({
              name: size.name,
              price: size.price,
            })),
          },
          extras: {
            create: parsed.data.extras.map((extra) => ({
              name: extra.name,
              price: extra.price,
            })),
          },
        },
        include: {
          sizes: true,
          extras: true,
        },
      }),
    );

    revalidatePublicMenuCache();

    return actionSuccess(created);
  } catch {
    return actionError("Failed to create product.");
  }
};

export const updateAdminProduct = async (
  productId: string,
  payload: AdminProductInput,
): Promise<ActionResponse<unknown>> => {
  const auth = await requireAdminSession();
  if (!auth.success) {
    return auth;
  }

  const validProductId = validateProductId(productId);
  if (!validProductId.success) {
    return validProductId;
  }

  const parsed = adminProductSchema.safeParse(payload);
  if (!parsed.success) {
    return actionError(
      "Invalid product payload.",
      toValidationErrors(parsed.error.flatten().fieldErrors),
    );
  }

  try {
    const existing = await withPrismaRetry(() =>
      db.product.findUnique({
        where: { id: validProductId.data },
        select: { id: true },
      }),
    );

    if (!existing) {
      return actionError("Product not found.");
    }

    const updated = await db.$transaction(async (tx) => {
      await tx.size.deleteMany({ where: { productId: validProductId.data } });
      await tx.extra.deleteMany({ where: { productId: validProductId.data } });

      return tx.product.update({
        where: { id: validProductId.data },
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          image: parsed.data.image,
          basePrice: parsed.data.basePrice,
          category: parsed.data.category,
          order: parsed.data.order ?? 0,
          sizes: {
            create: parsed.data.sizes.map((size) => ({
              name: size.name,
              price: size.price,
            })),
          },
          extras: {
            create: parsed.data.extras.map((extra) => ({
              name: extra.name,
              price: extra.price,
            })),
          },
        },
        include: {
          sizes: true,
          extras: true,
        },
      });
    });

    revalidatePublicMenuCache();

    return actionSuccess(updated);
  } catch {
    return actionError("Failed to update product.");
  }
};

export const deleteAdminProduct = async (
  productId: string,
): Promise<ActionResponse<{ deleted: true }>> => {
  const auth = await requireAdminSession();
  if (!auth.success) {
    return auth;
  }

  const validProductId = validateProductId(productId);
  if (!validProductId.success) {
    return validProductId;
  }

  try {
    const linkedOrderItemsCount = await withPrismaRetry(() =>
      db.orderItem.count({
        where: { productId: validProductId.data },
      }),
    );

    if (linkedOrderItemsCount > 0) {
      return actionError(
        "This product is linked to historical orders and cannot be deleted.",
      );
    }

    await db.$transaction(async (tx) => {
      await tx.size.deleteMany({ where: { productId: validProductId.data } });
      await tx.extra.deleteMany({ where: { productId: validProductId.data } });
      await tx.product.delete({ where: { id: validProductId.data } });
    });

    revalidatePublicMenuCache();

    return actionSuccess({ deleted: true });
  } catch {
    return actionError("Failed to delete product.");
  }
};

export const getAdminUsers = async (
  query: AdminUsersQuery,
): Promise<ActionResponse<PaginatedResult<AdminUserListItem>>> => {
  const auth = await requireAdminSession();
  if (!auth.success) {
    return auth;
  }

  const parsedQuery = adminUsersQuerySchema.safeParse(query);
  if (!parsedQuery.success) {
    return actionError(
      "Invalid users query.",
      toValidationErrors(parsedQuery.error.flatten().fieldErrors),
    );
  }

  const { page, pageSize, search, role } = parsedQuery.data;
  const roleFilter = role === "ALL" ? undefined : role;

  const where = {
    AND: [
      roleFilter ? { role: roleFilter } : {},
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
    ],
  };

  try {
    const [users, totalItems] = await Promise.all([
      withPrismaRetry(() =>
        db.user.findMany({
          where,
          orderBy: [{ role: "desc" }, { name: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            _count: {
              select: { orders: true },
            },
          },
        }),
      ),
      withPrismaRetry(() => db.user.count({ where })),
    ]);

    const items = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ordersCount: user._count.orders,
    }));

    return actionSuccess({
      items,
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    });
  } catch {
    return actionError("Failed to fetch users.");
  }
};

export const getAdminOrders = async (
  query: AdminOrderQuery,
): Promise<ActionResponse<PaginatedResult<AdminOrderListItem>>> => {
  const auth = await requireAdminSession();
  if (!auth.success) {
    return auth;
  }

  const parsedQuery = adminOrdersQuerySchema.safeParse(query);
  if (!parsedQuery.success) {
    return actionError(
      "Invalid orders query.",
      toValidationErrors(parsedQuery.error.flatten().fieldErrors),
    );
  }

  const { page, pageSize, search, status } = parsedQuery.data;

  const where = {
    AND: [
      status === "ALL" ? {} : { status },
      search
        ? {
            OR: [
              { id: { contains: search, mode: "insensitive" as const } },
              { address: { contains: search, mode: "insensitive" as const } },
              {
                user: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
              {
                user: {
                  email: { contains: search, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {},
    ],
  };

  try {
    const [orders, totalItems] = await Promise.all([
      withPrismaRetry(() =>
        db.order.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            userId: true,
            address: true,
            total: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                orderItems: true,
              },
            },
          },
        }),
      ),
      withPrismaRetry(() => db.order.count({ where })),
    ]);

    const items: AdminOrderListItem[] = orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      userName: order.user.name,
      userEmail: order.user.email,
      address: order.address,
      total: order.total,
      status: order.status as AdminOrderStatus,
      itemsCount: order._count.orderItems,
      createdAt: order.createdAt.toISOString(),
    }));

    return actionSuccess({
      items,
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    });
  } catch {
    return actionError("Failed to fetch orders.");
  }
};

export const updateAdminOrderStatus = async (
  orderId: string,
  status: number,
): Promise<
  ActionResponse<{
    id: string;
    status: AdminOrderStatus;
    updatedAt: string;
  }>
> => {
  const auth = await requireAdminSession();
  if (!auth.success) {
    return auth;
  }

  const parsed = adminOrderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) {
    return actionError(
      "Invalid order status payload.",
      toValidationErrors(parsed.error.flatten().fieldErrors),
    );
  }

  try {
    const current = await withPrismaRetry(() =>
      db.order.findUnique({
        where: { id: parsed.data.orderId },
        select: { id: true, status: true },
      }),
    );

    if (!current) {
      return actionError("Order not found.");
    }

    if (!isValidOrderTransition(current.status, parsed.data.status)) {
      return actionError("Illegal order status transition.");
    }

    const updated = await withPrismaRetry(() =>
      db.order.update({
        where: { id: parsed.data.orderId },
        data: { status: parsed.data.status },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      }),
    );

    return actionSuccess({
      id: updated.id,
      status: updated.status as AdminOrderStatus,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch {
    return actionError("Failed to update order status.");
  }
};
