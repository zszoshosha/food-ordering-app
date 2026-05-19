"use client";

import { ADMIN_ORDER_STATUS_OPTIONS } from "@/constants/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formatters";
import {
  AdminOverview,
  AdminOrderListItem,
  AdminOrderStatus,
  AdminUserListItem,
  PaginatedResult,
} from "@/types/admin";
import { ActionResponse } from "@/types/action-response";
import { ProductWithRelations } from "@/types/Product";
import { adminProductSchema } from "@/validation/admin";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ZodIssue } from "zod";

type DashboardTab = "menuItems" | "users" | "orders";

type ProductFormState = {
  id?: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  category: ProductCategoryValue;
  order: number;
  sizes: Array<{ name: ProductSizeValue; price: number }>;
  extras: Array<{ name: ExtraIngredientValue; price: number }>;
};

type ProductFieldName =
  | "name"
  | "description"
  | "image"
  | "basePrice"
  | "order"
  | "category"
  | "sizes"
  | "extras";

type ProductFormErrors = Partial<Record<ProductFieldName, string>>;

type ProductCategoryValue =
  | "CLASSIC"
  | "SPECIALTY"
  | "VEGETARIAN"
  | "MEAT"
  | "SEAFOOD";

type ProductSizeValue = "SMALL" | "MEDIUM" | "LARGE";
type ExtraIngredientValue = "CHEESE" | "BACON" | "MUSHROOMS" | "PEPPERS";

type AdminDashboardProps = {
  locale: string;
};

const PRODUCT_CATEGORY_OPTIONS: Array<{
  value: ProductCategoryValue;
  label: string;
}> = [
  { value: "CLASSIC", label: "Classic" },
  { value: "SPECIALTY", label: "Specialty" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "MEAT", label: "Meat Lovers" },
  { value: "SEAFOOD", label: "Seafood" },
];

const PRODUCT_SIZE_OPTIONS: Array<{ value: ProductSizeValue; label: string }> =
  [
    { value: "SMALL", label: "Small" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LARGE", label: "Large" },
  ];

const EXTRA_INGREDIENT_OPTIONS: Array<{
  value: ExtraIngredientValue;
  label: string;
}> = [
  { value: "CHEESE", label: "Cheese" },
  { value: "BACON", label: "Bacon" },
  { value: "MUSHROOMS", label: "Mushrooms" },
  { value: "PEPPERS", label: "Peppers" },
];

const USER_ROLE_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "USER", label: "Users" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "ADMIN", label: "Admins" },
] as const;

const ORDER_STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  ...ADMIN_ORDER_STATUS_OPTIONS.map((option) => ({
    value: String(option.value),
    label: option.label,
  })),
] as const;

const INITIAL_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  image: "",
  basePrice: 0,
  category: "CLASSIC",
  order: 0,
  sizes: [],
  extras: [],
};

const PRODUCT_FIELD_LABELS: Record<ProductFieldName, string> = {
  name: "Product Name",
  description: "Description",
  image: "Image",
  basePrice: "Base Price",
  order: "Display Order",
  category: "Category",
  sizes: "Sizes",
  extras: "Extras",
};

const ADMIN_AUTH_ERROR_MESSAGE =
  "You must be signed in as an admin to access this data.";

const getAdminFetchErrorMessage = async (
  response: Response,
  fallback: string,
) => {
  try {
    const payload = (await response.json()) as ActionResponse<unknown>;
    if (!payload.success) {
      if (payload.error === "Unauthorized") {
        return ADMIN_AUTH_ERROR_MESSAGE;
      }

      return payload.error || fallback;
    }

    return fallback;
  } catch {
    if (response.status === 401) {
      return ADMIN_AUTH_ERROR_MESSAGE;
    }

    return fallback;
  }
};

/**
 * Production admin dashboard for products, users, and orders.
 */
const AdminDashboard = ({ locale }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("menuItems");

  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productForm, setProductForm] =
    useState<ProductFormState>(INITIAL_PRODUCT_FORM);
  const [productFormErrors, setProductFormErrors] = useState<ProductFormErrors>(
    {},
  );
  const [productFormError, setProductFormError] = useState("");

  const [usersData, setUsersData] = useState<
    PaginatedResult<AdminUserListItem>
  >({
    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRole, setUsersRole] =
    useState<(typeof USER_ROLE_OPTIONS)[number]["value"]>("ALL");
  const [usersPage, setUsersPage] = useState(1);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  const [ordersData, setOrdersData] = useState<
    PaginatedResult<AdminOrderListItem>
  >({
    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatus, setOrdersStatus] =
    useState<(typeof ORDER_STATUS_FILTER_OPTIONS)[number]["value"]>("ALL");
  const [ordersPage, setOrdersPage] = useState(1);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  const [overview, setOverview] = useState<AdminOverview>({
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeDeliveryOrders: 0,
    totalUsers: 0,
    deliveryUsers: 0,
    totalProducts: 0,
  });
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);

  const tabLabels = useMemo(
    () => ({
      menuItems: locale === "ar" ? "عناصر القائمة" : "Menu Items",
      users: locale === "ar" ? "المستخدمون" : "Users",
      orders: locale === "ar" ? "الطلبات" : "Orders",
    }),
    [locale],
  );

  /**
   * Clears a single product field error after user edits it.
   */
  const clearProductFieldError = (fieldName: ProductFieldName) => {
    setProductFormErrors((current) => {
      if (!current[fieldName]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  };

  /**
   * Converts Zod issues into field-keyed error messages.
   */
  const mapIssuesToErrors = (issues: ZodIssue[]) => {
    return issues.reduce<ProductFormErrors>((accumulator, issue) => {
      const fieldName = issue.path[0] as ProductFieldName | undefined;
      if (!fieldName || accumulator[fieldName]) {
        return accumulator;
      }

      accumulator[fieldName] = issue.message;
      return accumulator;
    }, {});
  };

  /**
   * Builds the payload shape expected by the admin product schema.
   */
  const buildProductPayload = () => ({
    name: productForm.name,
    description: productForm.description,
    image: productForm.image,
    basePrice: productForm.basePrice,
    category: productForm.category,
    order: productForm.order,
    sizes: productForm.sizes,
    extras: productForm.extras,
  });

  /**
   * Loads product records for CRUD operations.
   */
  const fetchProducts = async () => {
    setIsProductsLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(
          await getAdminFetchErrorMessage(response, "Failed to load products."),
        );
      }

      const result = (await response.json()) as ActionResponse<
        ProductWithRelations[]
      >;
      if (!result.success) {
        throw new Error(result.error);
      }

      setProducts(result.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load products.";
      toast.error(message);
    } finally {
      setIsProductsLoading(false);
    }
  };

  /**
   * Loads owner-facing KPI summary values.
   */
  const fetchOverview = async () => {
    setIsOverviewLoading(true);

    try {
      const response = await fetch("/api/admin/overview", {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(
          await getAdminFetchErrorMessage(response, "Failed to load overview."),
        );
      }

      const result = (await response.json()) as ActionResponse<AdminOverview>;
      if (!result.success) {
        throw new Error(result.error);
      }

      setOverview(result.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load overview.";
      toast.error(message);
    } finally {
      setIsOverviewLoading(false);
    }
  };

  /**
   * Loads paginated users with server-side filtering.
   */
  const fetchUsers = async (params: {
    page: number;
    search: string;
    role: (typeof USER_ROLE_OPTIONS)[number]["value"];
  }) => {
    setIsUsersLoading(true);

    try {
      const query = new URLSearchParams({
        page: String(params.page),
        pageSize: "10",
        search: params.search,
        role: params.role,
      });

      const response = await fetch(`/api/admin/users?${query.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          await getAdminFetchErrorMessage(response, "Failed to load users."),
        );
      }

      const result = (await response.json()) as ActionResponse<
        PaginatedResult<AdminUserListItem>
      >;
      if (!result.success) {
        throw new Error(result.error);
      }

      setUsersData(result.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load users.";
      toast.error(message);
    } finally {
      setIsUsersLoading(false);
    }
  };

  /**
   * Loads paginated orders with server-side filtering.
   */
  const fetchOrders = async (params: {
    page: number;
    search: string;
    status: (typeof ORDER_STATUS_FILTER_OPTIONS)[number]["value"];
  }) => {
    setIsOrdersLoading(true);

    try {
      const query = new URLSearchParams({
        page: String(params.page),
        pageSize: "10",
        search: params.search,
        status: params.status,
      });

      const response = await fetch(`/api/admin/orders?${query.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          await getAdminFetchErrorMessage(response, "Failed to load orders."),
        );
      }

      const result = (await response.json()) as ActionResponse<
        PaginatedResult<AdminOrderListItem>
      >;
      if (!result.success) {
        throw new Error(result.error);
      }

      setOrdersData(result.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load orders.";
      toast.error(message);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOverview();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers({ page: usersPage, search: usersSearch, role: usersRole });
    }, 250);

    return () => clearTimeout(timer);
  }, [usersPage, usersSearch, usersRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders({
        page: ordersPage,
        search: ordersSearch,
        status: ordersStatus,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [ordersPage, ordersSearch, ordersStatus]);

  /**
   * Opens the product modal in create mode.
   */
  const openCreateProductModal = () => {
    setProductForm(INITIAL_PRODUCT_FORM);
    setProductFormErrors({});
    setProductFormError("");
    setIsProductModalOpen(true);
  };

  /**
   * Opens the product modal in edit mode.
   */
  const openEditProductModal = (product: ProductWithRelations) => {
    setProductFormErrors({});
    setProductFormError("");
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      basePrice: Number(product.basePrice),
      category: product.category,
      order: product.order,
      sizes: product.sizes.map((size) => ({
        name: size.name,
        price: Number(size.price),
      })),
      extras: product.extras.map((extra) => ({
        name: extra.name,
        price: Number(extra.price),
      })),
    });
    setIsProductModalOpen(true);
  };

  /**
   * Uploads an image and updates the product form with returned URL.
   */
  const handleImageUpload = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);

    const uploadPromise = fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    toast.promise(uploadPromise, {
      loading: "Uploading image...",
      success: "Image uploaded",
      error: "Image upload failed",
    });

    const response = await uploadPromise;

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error ?? "Image upload failed.");
    }

    const payload = (await response.json()) as { imageUrl: string };
    setProductForm((prev) => ({ ...prev, image: payload.imageUrl }));
  };

  /**
   * Persists product create/update changes via admin API.
   */
  const submitProduct = async () => {
    setIsSavingProduct(true);

    try {
      const payload = buildProductPayload();
      const parsed = adminProductSchema.safeParse(payload);

      if (!parsed.success) {
        const fieldErrors = mapIssuesToErrors(parsed.error.issues);
        setProductFormErrors(fieldErrors);
        setProductFormError("Please fix the highlighted fields.");
        return;
      }

      const isEditing = Boolean(productForm.id);
      const endpoint = isEditing
        ? `/api/admin/products?id=${productForm.id}`
        : "/api/admin/products";

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          locale,
        }),
      });

      const result =
        (await response.json()) as ActionResponse<ProductWithRelations>;

      if (!response.ok) {
        if (!result.success && result.validationErrors) {
          const nextErrors = Object.entries(
            result.validationErrors,
          ).reduce<ProductFormErrors>((accumulator, [fieldName, messages]) => {
            if (messages?.length) {
              accumulator[fieldName as ProductFieldName] = messages[0];
            }

            return accumulator;
          }, {});

          setProductFormErrors(nextErrors);
          setProductFormError(
            result.error || "Please fix the highlighted fields.",
          );
          return;
        }

        if (!result.success) {
          throw new Error(result.error || "Failed to save product.");
        }

        throw new Error("Failed to save product.");
      }

      setIsProductModalOpen(false);
      setProductFormErrors({});
      setProductFormError("");
      await fetchProducts();
      toast.success(isEditing ? "Product updated." : "Product created.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save product.";
      setProductFormError(message);
      toast.error(message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  /**
   * Deletes a product and refreshes the products list.
   */
  const removeProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as ActionResponse<{
        deleted: true;
      }>;

      if (!response.ok) {
        if (!payload.success) {
          throw new Error(payload.error || "Failed to delete product.");
        }

        throw new Error("Failed to delete product.");
      }

      setProducts((prev) => prev.filter((item) => item.id !== productId));
      toast.success("Product deleted.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete product.";
      toast.error(message);
    }
  };

  /**
   * Updates order status and applies optimistic row update.
   */
  const updateOrderStatus = async (
    orderId: string,
    status: AdminOrderStatus,
  ) => {
    const previousItems = ordersData.items;

    setOrdersData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === orderId ? { ...item, status } : item,
      ),
    }));

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      const payload = (await response.json()) as ActionResponse<{
        id: string;
        status: AdminOrderStatus;
        updatedAt: string;
      }>;

      if (!response.ok) {
        if (!payload.success) {
          throw new Error(payload.error || "Failed to update order status.");
        }

        throw new Error("Failed to update order status.");
      }

      if (
        payload.success &&
        typeof payload.data.status === "number" &&
        payload.data.status in AdminOrderStatus
      ) {
        const nextStatus = payload.data.status as AdminOrderStatus;
        setOrdersData((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === payload.data.id
              ? { ...item, status: nextStatus }
              : item,
          ),
        }));
      }

      toast.success("Order status updated.");
    } catch (error) {
      setOrdersData((prev) => ({ ...prev, items: previousItems }));
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update order status.";
      toast.error(message);
    }
  };

  return (
    <section className="mt-8 rounded-3xl border bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">
          Operations Console
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage menu, users, and order fulfillment from one dashboard.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b pb-4">
        <Button
          variant={activeTab === "menuItems" ? "default" : "outline"}
          onClick={() => setActiveTab("menuItems")}
        >
          {tabLabels.menuItems}
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "outline"}
          onClick={() => setActiveTab("users")}
        >
          {tabLabels.users}
        </Button>
        <Button
          variant={activeTab === "orders" ? "default" : "outline"}
          onClick={() => setActiveTab("orders")}
        >
          {tabLabels.orders}
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Total Revenue
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {isOverviewLoading ? "..." : formatCurrency(overview.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Today:{" "}
            {isOverviewLoading ? "..." : formatCurrency(overview.todayRevenue)}
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Orders
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {isOverviewLoading ? "..." : overview.totalOrders}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pending: {isOverviewLoading ? "..." : overview.pendingOrders}
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Delivery Ops
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {isOverviewLoading ? "..." : overview.activeDeliveryOrders}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Delivery users: {isOverviewLoading ? "..." : overview.deliveryUsers}
          </p>
        </div>

        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Catalog & Users
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {isOverviewLoading ? "..." : overview.totalProducts}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Users: {isOverviewLoading ? "..." : overview.totalUsers}
          </p>
        </div>
      </div>

      {activeTab === "menuItems" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Products</h3>
            <Button onClick={openCreateProductModal}>Add Product</Button>
          </div>

          {isProductsLoading ? (
            <p className="text-sm text-muted-foreground">Loading products...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Base Price</th>
                    <th className="px-3 py-2 text-left">Sort</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="px-3 py-2">{product.name}</td>
                      <td className="px-3 py-2">{product.category}</td>
                      <td className="px-3 py-2">
                        {formatCurrency(Number(product.basePrice))}
                      </td>
                      <td className="px-3 py-2">{product.order}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditProductModal(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by name or email"
              value={usersSearch}
              onChange={(event) => {
                setUsersPage(1);
                setUsersSearch(event.target.value);
              }}
              className="max-w-sm"
            />
            <select
              title="Filter users by role"
              aria-label="Filter users by role"
              value={usersRole}
              onChange={(event) => {
                setUsersPage(1);
                setUsersRole(
                  event.target
                    .value as (typeof USER_ROLE_OPTIONS)[number]["value"],
                );
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {USER_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isUsersLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Role</th>
                    <th className="px-3 py-2 text-left">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.items.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="px-3 py-2">{user.name}</td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2">{user.role}</td>
                      <td className="px-3 py-2">{user.ordersCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {usersData.page} of {usersData.totalPages} (
              {usersData.totalItems} users)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={usersData.page <= 1}
                onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={usersData.page >= usersData.totalPages}
                onClick={() =>
                  setUsersPage((prev) =>
                    Math.min(usersData.totalPages, prev + 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by order id, customer, email, or address"
              value={ordersSearch}
              onChange={(event) => {
                setOrdersPage(1);
                setOrdersSearch(event.target.value);
              }}
              className="max-w-sm"
            />
            <select
              title="Filter orders by status"
              aria-label="Filter orders by status"
              value={ordersStatus}
              onChange={(event) => {
                setOrdersPage(1);
                setOrdersStatus(
                  event.target
                    .value as (typeof ORDER_STATUS_FILTER_OPTIONS)[number]["value"],
                );
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isOrdersLoading ? (
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Order ID</th>
                    <th className="px-3 py-2 text-left">Customer</th>
                    <th className="px-3 py-2 text-left">Address</th>
                    <th className="px-3 py-2 text-left">Items</th>
                    <th className="px-3 py-2 text-left">Total</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.items.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="px-3 py-2">{order.id.slice(0, 8)}</td>
                      <td className="px-3 py-2">
                        <div>{order.userName}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.userEmail}
                        </div>
                      </td>
                      <td className="px-3 py-2">{order.address}</td>
                      <td className="px-3 py-2">{order.itemsCount}</td>
                      <td className="px-3 py-2">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          title="Update order status"
                          aria-label="Update order status"
                          value={String(order.status)}
                          onChange={(event) => {
                            const nextStatus = Number.parseInt(
                              event.target.value,
                              10,
                            );
                            updateOrderStatus(
                              order.id,
                              nextStatus as AdminOrderStatus,
                            );
                          }}
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        >
                          {ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
                            <option
                              key={`${order.id}-${option.value}`}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {ordersData.page} of {ordersData.totalPages} (
              {ordersData.totalItems} orders)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={ordersData.page <= 1}
                onClick={() => setOrdersPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={ordersData.page >= ordersData.totalPages}
                onClick={() =>
                  setOrdersPage((prev) =>
                    Math.min(ordersData.totalPages, prev + 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4">
          <div className="mx-auto mt-6 max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {productForm.id ? "Edit Product" : "Create Product"}
              </h3>
              <Button
                variant="ghost"
                onClick={() => setIsProductModalOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="grid gap-3">
              {productFormError ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {productFormError}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="product-name">
                  {PRODUCT_FIELD_LABELS.name}
                </Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(event) => {
                    clearProductFieldError("name");
                    setProductForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }));
                  }}
                  placeholder="Product name"
                />
                {productFormErrors.name ? (
                  <p className="text-sm text-destructive">
                    {productFormErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">
                  {PRODUCT_FIELD_LABELS.description}
                </Label>
                <textarea
                  id="product-description"
                  value={productForm.description}
                  onChange={(event) => {
                    clearProductFieldError("description");
                    setProductForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }));
                  }}
                  placeholder="Description"
                  className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                {productFormErrors.description ? (
                  <p className="text-sm text-destructive">
                    {productFormErrors.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-base-price">
                    {PRODUCT_FIELD_LABELS.basePrice}
                  </Label>
                  <Input
                    id="product-base-price"
                    type="number"
                    value={productForm.basePrice}
                    onChange={(event) => {
                      clearProductFieldError("basePrice");
                      setProductForm((prev) => ({
                        ...prev,
                        basePrice: Number.parseFloat(event.target.value || "0"),
                      }));
                    }}
                    placeholder="Base price"
                    min={0}
                  />
                  {productFormErrors.basePrice ? (
                    <p className="text-sm text-destructive">
                      {productFormErrors.basePrice}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-display-order">
                    {PRODUCT_FIELD_LABELS.order}
                  </Label>
                  <Input
                    id="product-display-order"
                    type="number"
                    value={productForm.order}
                    onChange={(event) => {
                      clearProductFieldError("order");
                      setProductForm((prev) => ({
                        ...prev,
                        order: Number.parseInt(event.target.value || "0", 10),
                      }));
                    }}
                    placeholder="Sort order"
                    min={0}
                  />
                  {productFormErrors.order ? (
                    <p className="text-sm text-destructive">
                      {productFormErrors.order}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-category">
                  {PRODUCT_FIELD_LABELS.category}
                </Label>
                <select
                  id="product-category"
                  title="Select product category"
                  aria-label="Select product category"
                  value={productForm.category}
                  onChange={(event) => {
                    clearProductFieldError("category");
                    setProductForm((prev) => ({
                      ...prev,
                      category: event.target.value as ProductCategoryValue,
                    }));
                  }}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {productFormErrors.category ? (
                  <p className="text-sm text-destructive">
                    {productFormErrors.category}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-image-url">Image URL</Label>
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    id="product-image-url"
                    value={productForm.image}
                    readOnly
                    placeholder="Image URL"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }

                      try {
                        clearProductFieldError("image");
                        await handleImageUpload(file);
                      } catch (error) {
                        const message =
                          error instanceof Error
                            ? error.message
                            : "Image upload failed.";
                        toast.error(message);
                      }
                    }}
                    className="max-w-full md:max-w-xs"
                  />
                </div>
                {productFormErrors.image ? (
                  <p className="text-sm text-destructive">
                    {productFormErrors.image}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Sizes</h4>
                    {productFormErrors.sizes ? (
                      <p className="text-sm text-destructive">
                        {productFormErrors.sizes}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      clearProductFieldError("sizes");
                      setProductForm((prev) => ({
                        ...prev,
                        sizes: [...prev.sizes, { name: "SMALL", price: 0 }],
                      }));
                    }}
                  >
                    Add Size
                  </Button>
                </div>
                <div className="space-y-2">
                  {productForm.sizes.map((size, index) => (
                    <div
                      key={`size-${index}`}
                      className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <select
                          title="Select product size"
                          aria-label="Select product size"
                          value={size.name}
                          onChange={(event) => {
                            clearProductFieldError("sizes");
                            setProductForm((prev) => ({
                              ...prev,
                              sizes: prev.sizes.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? {
                                      ...entry,
                                      name: event.target
                                        .value as ProductSizeValue,
                                    }
                                  : entry,
                              ),
                            }));
                          }}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {PRODUCT_SIZE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Additional Price</Label>
                        <Input
                          type="number"
                          min={0}
                          value={size.price}
                          onChange={(event) => {
                            clearProductFieldError("sizes");
                            setProductForm((prev) => ({
                              ...prev,
                              sizes: prev.sizes.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? {
                                      ...entry,
                                      price: Number.parseFloat(
                                        event.target.value || "0",
                                      ),
                                    }
                                  : entry,
                              ),
                            }));
                          }}
                          placeholder="Extra price"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          clearProductFieldError("sizes");
                          setProductForm((prev) => ({
                            ...prev,
                            sizes: prev.sizes.filter(
                              (_, entryIndex) => entryIndex !== index,
                            ),
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Extras</h4>
                    {productFormErrors.extras ? (
                      <p className="text-sm text-destructive">
                        {productFormErrors.extras}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      clearProductFieldError("extras");
                      setProductForm((prev) => ({
                        ...prev,
                        extras: [...prev.extras, { name: "CHEESE", price: 0 }],
                      }));
                    }}
                  >
                    Add Extra
                  </Button>
                </div>
                <div className="space-y-2">
                  {productForm.extras.map((extra, index) => (
                    <div
                      key={`extra-${index}`}
                      className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="space-y-2">
                        <Label>Extra Ingredient</Label>
                        <select
                          title="Select extra ingredient"
                          aria-label="Select extra ingredient"
                          value={extra.name}
                          onChange={(event) => {
                            clearProductFieldError("extras");
                            setProductForm((prev) => ({
                              ...prev,
                              extras: prev.extras.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? {
                                      ...entry,
                                      name: event.target
                                        .value as ExtraIngredientValue,
                                    }
                                  : entry,
                              ),
                            }));
                          }}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {EXTRA_INGREDIENT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Additional Price</Label>
                        <Input
                          type="number"
                          min={0}
                          value={extra.price}
                          onChange={(event) => {
                            clearProductFieldError("extras");
                            setProductForm((prev) => ({
                              ...prev,
                              extras: prev.extras.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? {
                                      ...entry,
                                      price: Number.parseFloat(
                                        event.target.value || "0",
                                      ),
                                    }
                                  : entry,
                              ),
                            }));
                          }}
                          placeholder="Extra price"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          clearProductFieldError("extras");
                          setProductForm((prev) => ({
                            ...prev,
                            extras: prev.extras.filter(
                              (_, entryIndex) => entryIndex !== index,
                            ),
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={submitProduct} disabled={isSavingProduct}>
                  {isSavingProduct ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
