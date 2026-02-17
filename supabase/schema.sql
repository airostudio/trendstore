-- ============================================================
-- Trend Store – Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE tenancy_mode        AS ENUM ('SAAS','SELF_HOSTED');
CREATE TYPE user_role           AS ENUM ('OWNER','ADMIN','MANAGER','SUPPORT','MARKETING','READONLY');
CREATE TYPE product_status      AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
CREATE TYPE order_status        AS ENUM ('DRAFT','PENDING_PAYMENT','PAID','FULFILLING','FULFILLED','DELIVERED','CANCELED','RETURN_REQUESTED','RETURNED','REFUNDED');
CREATE TYPE payment_status      AS ENUM ('REQUIRES_ACTION','PROCESSING','SUCCEEDED','FAILED','REFUNDED','PARTIALLY_REFUNDED');
CREATE TYPE fulfillment_status  AS ENUM ('UNFULFILLED','PARTIAL','FULFILLED');
CREATE TYPE return_status       AS ENUM ('REQUESTED','APPROVED','REJECTED','RECEIVED','REFUNDED','CLOSED');
CREATE TYPE discount_type       AS ENUM ('PERCENT','FIXED','FREE_SHIPPING');
CREATE TYPE discount_applies_to AS ENUM ('ORDER','SHIPPING','PRODUCT');
CREATE TYPE import_status       AS ENUM ('QUEUED','RUNNING','COMPLETED','FAILED');

-- ── Core tenant tables ────────────────────────────────────────
CREATE TABLE tenants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  primary_domain TEXT UNIQUE,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_settings (
  tenant_id                   UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  tenancy_mode                tenancy_mode NOT NULL DEFAULT 'SAAS',
  brand_name                  TEXT NOT NULL,
  logo_url                    TEXT,
  favicon_url                 TEXT,
  hero_image_url              TEXT,
  theme_json                  JSONB,
  contact_email               TEXT,
  contact_phone               TEXT,
  contact_address             TEXT,
  seo_title_default           TEXT,
  seo_desc_default            TEXT,
  og_image_default            TEXT,
  use_gender_neutral_language BOOLEAN NOT NULL DEFAULT true,
  collect_pronouns            BOOLEAN NOT NULL DEFAULT false,
  base_currency               TEXT NOT NULL DEFAULT 'USD',
  enabled_currencies          TEXT[] NOT NULL DEFAULT ARRAY['USD'],
  cookie_consent_enabled      BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE tax_settings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  mode             TEXT NOT NULL DEFAULT 'AUTO',
  provider         TEXT,
  is_tax_inclusive BOOLEAN NOT NULL DEFAULT false,
  default_rate_bps INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Users & memberships ───────────────────────────────────────
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE memberships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       user_role NOT NULL DEFAULT 'ADMIN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id)
);

-- ── Audit ─────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id   UUID,
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL,
  entity_id  TEXT,
  meta       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Customers ─────────────────────────────────────────────────
CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT,
  phone      TEXT,
  pronouns   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);

-- ── Catalogue ─────────────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  handle      TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, handle)
);

CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  handle       TEXT NOT NULL,
  description  TEXT,
  status       product_status NOT NULL DEFAULT 'DRAFT',
  seo_title    TEXT,
  seo_desc     TEXT,
  og_image_url TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, handle)
);

CREATE TABLE product_variants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title         TEXT,
  sku           TEXT,
  barcode       TEXT,
  price         INT NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  compare_at    INT,
  cost          INT,
  weight_grams  INT,
  option1_name  TEXT,
  option1_value TEXT,
  option2_name  TEXT,
  option2_value TEXT,
  option3_name  TEXT,
  option3_value TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id          UUID NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
  stock_on_hand       INT NOT NULL DEFAULT 0,
  stock_reserved      INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  allow_backorder     BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE product_media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  position   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_categories (
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE product_tags (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- ── Shipping ──────────────────────────────────────────────────
CREATE TABLE shipping_zones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  countries  TEXT[] NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shipping_methods (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  zone_id      UUID REFERENCES shipping_zones(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  price        INT NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'USD',
  min_subtotal INT,
  max_subtotal INT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  eta_days_min INT,
  eta_days_max INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Cart ──────────────────────────────────────────────────────
CREATE TABLE carts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id  UUID REFERENCES customers(id) ON DELETE SET NULL,
  email        TEXT,
  currency     TEXT NOT NULL DEFAULT 'USD',
  abandoned_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity   INT NOT NULL DEFAULT 1,
  unit_price INT NOT NULL,
  UNIQUE (cart_id, variant_id)
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id    UUID REFERENCES customers(id) ON DELETE SET NULL,
  status         order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  currency       TEXT NOT NULL DEFAULT 'USD',
  subtotal       INT NOT NULL,
  tax_total      INT NOT NULL DEFAULT 0,
  shipping_total INT NOT NULL DEFAULT 0,
  discount_total INT NOT NULL DEFAULT 0,
  total          INT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  title      TEXT NOT NULL,
  sku        TEXT,
  quantity   INT NOT NULL,
  unit_price INT NOT NULL,
  line_total INT NOT NULL
);

CREATE TABLE payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL,
  provider_ref TEXT NOT NULL,
  status       payment_status NOT NULL,
  amount       INT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_ref)
);

-- ── Promotions ────────────────────────────────────────────────
CREATE TABLE discounts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code         TEXT NOT NULL,
  type         discount_type NOT NULL,
  applies_to   discount_applies_to NOT NULL DEFAULT 'ORDER',
  value        INT NOT NULL,
  currency     TEXT,
  usage_limit  INT,
  used_count   INT NOT NULL DEFAULT 0,
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  min_subtotal INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE gift_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  initial_balance INT NOT NULL,
  balance         INT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

-- ── Loyalty & credits ─────────────────────────────────────────
CREATE TABLE store_credit_ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount      INT NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'USD',
  reason      TEXT NOT NULL,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_rules (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  event              TEXT NOT NULL,
  points_per_usd_bps INT NOT NULL DEFAULT 100,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  points      INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Affiliates & marketing ────────────────────────────────────
CREATE TABLE affiliates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code       TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE blog_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL,
  content    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

-- ── Operations ────────────────────────────────────────────────
CREATE TABLE return_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reason        TEXT,
  status        return_status NOT NULL DEFAULT 'REQUESTED',
  refund_amount INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE import_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  status     import_status NOT NULL DEFAULT 'QUEUED',
  file_url   TEXT NOT NULL,
  mapping    JSONB NOT NULL,
  options    JSONB,
  result     JSONB,
  progress   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_integrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  secret      TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seed data ─────────────────────────────────────────────────
INSERT INTO tenants (id, name, slug, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Trend Store', 'trend-store', true);

INSERT INTO tenant_settings (tenant_id, brand_name, seo_title_default, seo_desc_default)
VALUES ('00000000-0000-0000-0000-000000000001', 'Trend Store', 'Trend Store', 'Modern commerce powered by Trend Store.');

INSERT INTO tax_settings (tenant_id, mode, is_tax_inclusive, default_rate_bps)
VALUES ('00000000-0000-0000-0000-000000000001', 'MANUAL', false, 0);

-- Admin user  (password: admin123)
INSERT INTO users (id, email, name, password)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'admin@trendstore.local',
  'Trend Admin',
  '$2a$10$lnquND56QkN3HvYYCWmDF.c42Vt78gp6GibdPpS5fHyajtuPSy75u'
);

INSERT INTO memberships (tenant_id, user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'OWNER');

INSERT INTO shipping_zones (id, tenant_id, name, countries)
VALUES ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'United States', ARRAY['US']);

INSERT INTO shipping_methods (tenant_id, zone_id, name, price, currency, eta_days_min, eta_days_max)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Standard Shipping (3–5 days)', 799, 'USD', 3, 5);

INSERT INTO categories (id, tenant_id, name, handle)
VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'New Arrivals', 'new-arrivals');

INSERT INTO tags (id, tenant_id, name)
VALUES ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Limited');

INSERT INTO products (id, tenant_id, title, handle, description, status)
VALUES ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Metro Hoodie', 'metro-hoodie', 'A heavyweight hoodie with a clean fit.', 'PUBLISHED');

INSERT INTO product_variants (id, product_id, sku, price, currency)
VALUES ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010', 'METRO-HOOD-DEFAULT', 6400, 'USD');

INSERT INTO inventory_items (variant_id, stock_on_hand, low_stock_threshold)
VALUES ('00000000-0000-0000-0000-000000000011', 25, 5);

INSERT INTO product_categories (product_id, category_id)
VALUES ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000004');

INSERT INTO product_tags (product_id, tag_id)
VALUES ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000005');
