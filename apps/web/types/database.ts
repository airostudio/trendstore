export type TenancyMode = "SAAS" | "SELF_HOSTED";
export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "SUPPORT" | "MARKETING" | "READONLY";
export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type OrderStatus =
  | "DRAFT" | "PENDING_PAYMENT" | "PAID" | "FULFILLING" | "FULFILLED"
  | "DELIVERED" | "CANCELED" | "RETURN_REQUESTED" | "RETURNED" | "REFUNDED";
export type PaymentStatus =
  | "REQUIRES_ACTION" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED" | "CLOSED";
export type DiscountType = "PERCENT" | "FIXED" | "FREE_SHIPPING";
export type DiscountAppliesTo = "ORDER" | "SHIPPING" | "PRODUCT";
export type ImportStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  primary_domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  tenant_id: string;
  tenancy_mode: TenancyMode;
  brand_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  hero_image_url: string | null;
  theme_json: Record<string, unknown> | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  seo_title_default: string | null;
  seo_desc_default: string | null;
  og_image_default: string | null;
  use_gender_neutral_language: boolean;
  collect_pronouns: boolean;
  base_currency: string;
  enabled_currencies: string[];
  cookie_consent_enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  pronouns: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  handle: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  tenant_id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  title: string;
  handle: string;
  description: string | null;
  status: ProductStatus;
  seo_title: string | null;
  seo_desc: string | null;
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  currency: string;
  compare_at: number | null;
  cost: number | null;
  weight_grams: number | null;
  option1_name: string | null;
  option1_value: string | null;
  option2_name: string | null;
  option2_value: string | null;
  option3_name: string | null;
  option3_value: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  variant_id: string;
  stock_on_hand: number;
  stock_reserved: number;
  low_stock_threshold: number;
  allow_backorder: boolean;
}

export interface Order {
  id: string;
  tenant_id: string;
  customer_id: string | null;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  title: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

// Supabase Database type (used by createClient generic)
export type Database = {
  public: {
    Tables: {
      tenants: { Row: Tenant; Insert: Partial<Tenant>; Update: Partial<Tenant> };
      tenant_settings: { Row: TenantSettings; Insert: Partial<TenantSettings>; Update: Partial<TenantSettings> };
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      memberships: { Row: Membership; Insert: Partial<Membership>; Update: Partial<Membership> };
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      tags: { Row: Tag; Insert: Partial<Tag>; Update: Partial<Tag> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      product_variants: { Row: ProductVariant; Insert: Partial<ProductVariant>; Update: Partial<ProductVariant> };
      inventory_items: { Row: InventoryItem; Insert: Partial<InventoryItem>; Update: Partial<InventoryItem> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
