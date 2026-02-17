import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { logError } from "@/lib/logger";

const TENANT_SLUG = "trend-store";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("tenant") || TENANT_SLUG;
    const all = request.nextUrl.searchParams.get("all") === "1";

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!tenant) return NextResponse.json({ products: [] });

    let query = supabase
      .from("products")
      .select(`
        *,
        product_variants (*, inventory_items (*)),
        product_categories (categories (*)),
        product_tags (tags (*))
      `)
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });

    if (!all) query = query.eq("status", "PUBLISHED");

    const { data: products, error } = await query;
    if (error) throw error;

    return NextResponse.json({ products: products ?? [] });
  } catch (error) {
    logError("ProductsGET", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, handle, description, tenantId, price, sku } = productSchema.parse(body);

    const { data: product, error: pErr } = await supabase
      .from("products")
      .insert({ tenant_id: tenantId, title, handle, description: description ?? null, status: "DRAFT" })
      .select()
      .single();

    if (pErr || !product) throw pErr;

    const { data: variant, error: vErr } = await supabase
      .from("product_variants")
      .insert({ product_id: product.id, sku: sku || `${handle}-default`, price: price ?? 0, currency: "USD", is_active: true })
      .select()
      .single();

    if (vErr || !variant) throw vErr;

    await supabase
      .from("inventory_items")
      .insert({ variant_id: variant.id, stock_on_hand: 0, low_stock_threshold: 5, allow_backorder: false });

    return NextResponse.json({ product: { ...product, product_variants: [variant] } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    logError("ProductsPOST", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
