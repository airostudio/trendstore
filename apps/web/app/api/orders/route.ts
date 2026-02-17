import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations";
import { logError } from "@/lib/logger";

const TENANT_SLUG = "trend-store";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const slug = request.nextUrl.searchParams.get("tenant") || TENANT_SLUG;

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!tenant) return NextResponse.json({ orders: [] });

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`*, customers (*), order_items (*, product_variants (*, products (*)))`)
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ orders: orders ?? [] });
  } catch (error) {
    logError("OrdersGET", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, customerId, items, subtotal, total } = createOrderSchema.parse(body);

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        tenant_id: tenantId,
        customer_id: customerId ?? null,
        status: "PENDING_PAYMENT",
        currency: "USD",
        subtotal,
        total,
        tax_total: 0,
        shipping_total: 0,
        discount_total: 0,
      })
      .select()
      .single();

    if (oErr || !order) throw oErr;

    const lineItems = items.map((item) => ({
      order_id: order.id,
      variant_id: item.variantId,
      title: item.title,
      sku: item.sku ?? null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.quantity * item.unitPrice,
    }));

    const { error: iErr } = await supabase.from("order_items").insert(lineItems);
    if (iErr) throw iErr;

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    logError("OrdersPOST", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
