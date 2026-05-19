"use server";

import { authOptions } from "@/server/auth";
import {
  AdminOverview,
  AdminOrderListItem,
  AdminOrderStatus,
  AdminProductInput,
  AdminUserListItem,
  PaginatedResult,
  PaginationQuery,
} from "@/types/admin";
import {
  adminOrderStatusSchema,
  adminPaginationSchema,
  adminProductSchema,
} from "@/validation/admin";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { db, withPrismaRetry } from "@/lib/prisma";
import * as z from "zod";

type AdminOrderQuery = PaginationQuery & {
  status?: string;
};

type AdminUsersQuery = PaginationQuery & {
  role?: string;
};

/**
 * Ensures the current request belongs to an authenticated admin user.
 */
const requireAdminSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    console.error("Unauthorized access attempt", { session }); // Log unauthorized access
    throw new Error("Unauthorized");
  }

  return session;
};

/**
 * Parses pagination defaults and keeps search deterministic.
 */
const parsePagination = (query: PaginationQuery) => {
  const parsed = adminPaginationSchema.safeParse(query);
  if (!parsed.success) {
    console.error("Pagination schema validation failed", parsed.error.issues); // Log validation errors
    throw new z.ZodError(parsed.error.issues);
  }

  return parsed.data;
};

/**
 * Returns owner-focused aggregate metrics for the admin dashboard header cards.
 */
export const getAdminOverview = async (): Promise<AdminOverview> => {
  await requireAdminSession();

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
    withPrismaRetry(() => db.order.count({ where: { status: 2 } })),
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

  return {
    totalRevenue: Number(revenueAgg._sum.total ?? 0),
    todayRevenue: Number(todayRevenueAgg._sum.total ?? 0),
    totalOrders,
    pendingOrders,
    activeDeliveryOrders,
    totalUsers,
    deliveryUsers,
    totalProducts,
  };
};

/**
 * Returns admin products ordered by sorting index then creation date.
 */
export const getAdminProducts = async () => {
  await requireAdminSession();

  return withPrismaRetry(() =>
    db.product.findMany({
      include: { sizes: true, extras: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  );
};

/**
 * Creates a new product with optional sizes and extras.
 */
export const createAdminProduct = async (
  payload: AdminProductInput,
  locale: string,
) => {
  await requireAdminSession();

  const parsed = adminProductSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

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

    return {
      ok: false as const,
      status: 409,
      error: duplicateMessage,
      fieldErrors: {
        name: [duplicateMessage],
      },
    };
  }

  const maxOrder = await db.product.aggregate({
    _max: { order: true },
  });

  const created = await db.product.create({
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
  });

  return {
    ok: true as const,
    status: 201,
    item: created,
  };
};

/**
 * Updates a product and replaces related sizes/extras in a transaction.
 */
export const updateAdminProduct = async (
  productId: string,
  payload: AdminProductInput,
) => {
  await requireAdminSession();

  const parsed = adminProductSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await withPrismaRetry(() =>
    db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    }),
  );

  if (!existing) {
    return {
      ok: false as const,
      status: 404,
      error: "Product not found.",
    };
  }

  const updated = await db.$transaction(async (tx) => {
    await tx.size.deleteMany({ where: { productId } });
    await tx.extra.deleteMany({ where: { productId } });

    return tx.product.update({
      where: { id: productId },
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

  return {
    ok: true as const,
    status: 200,
    item: updated,
  };
};

/**
 * Deletes a product that is not referenced by order items.
 */
export const deleteAdminProduct = async (productId: string) => {
  await requireAdminSession();

  const linkedOrderItemsCount = await withPrismaRetry(() =>
    db.orderItem.count({
      where: { productId },
    }),
  );

  if (linkedOrderItemsCount > 0) {
    return {
      ok: false as const,
      status: 409,
      error:
        "This product is linked to historical orders and cannot be deleted.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.size.deleteMany({ where: { productId } });
    await tx.extra.deleteMany({ where: { productId } });
    await tx.product.delete({ where: { id: productId } });
  });

  return {
    ok: true as const,
    status: 200,
  };
};

/**
 * Returns paginated users with optional role and search filters.
 */
export const getAdminUsers = async (
  query: AdminUsersQuery,
): Promise<PaginatedResult<AdminUserListItem>> => {
  await requireAdminSession();

  const { page, pageSize, search } = parsePagination(query);
  const roleFilter =
    query.role && query.role !== "ALL" ? (query.role as UserRole) : undefined;

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

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
};

/**
 * Returns paginated orders with optional status and search filters.
 */
export const getAdminOrders = async (
  query: AdminOrderQuery,
): Promise<PaginatedResult<AdminOrderListItem>> => {
  await requireAdminSession();

  const { page, pageSize, search } = parsePagination(query);
  const status =
    query.status && query.status !== "ALL"
      ? Number.parseInt(query.status, 10)
      : null;

  const where = {
    AND: [
      Number.isInteger(status) ? { status: status as number } : {},
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

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
};

/**
 * Updates the status of a single order.
 */
export const updateAdminOrderStatus = async (
  orderId: string,
  status: number,
) => {
  await requireAdminSession();

  const parsed = adminOrderStatusSchema.safeParse({ orderId, status });
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const updated = await db.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return {
    ok: true as const,
    status: 200,
    item: {
      id: updated.id,
      status: updated.status as AdminOrderStatus,
      updatedAt: updated.updatedAt.toISOString(),
    },
  };
};
