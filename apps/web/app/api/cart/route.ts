import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { createCartSchema } from "@/lib/validations";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, customerId, items } = createCartSchema.parse(body);

    const variantIds = items.map((i) => i.variantId);
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, price")
      .in("id", variantIds);

    const priceMap = new Map((variants ?? []).map((v) => [v.id, v.price]));

    const { data: cart, error: cErr } = await supabase
      .from("carts")
      .insert({ tenant_id: tenantId, customer_id: customerId ?? null, currency: "USD" })
      .select()
      .single();

    if (cErr || !cart) throw cErr;

    const cartItems = items.map((item) => ({
      cart_id: cart.id,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.unitPrice ?? priceMap.get(item.variantId) ?? 0,
    }));

    const { error: iErr } = await supabase.from("cart_items").insert(cartItems);
    if (iErr) throw iErr;

    return NextResponse.json({ cart }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    logError("CartPOST", error);
    return NextResponse.json({ error: "Failed to create cart" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cartId = request.nextUrl.searchParams.get("id");
    if (!cartId) return NextResponse.json({ error: "Cart ID required" }, { status: 400 });

    const { data: cart, error } = await supabase
      .from("carts")
      .select(`*, cart_items (*, product_variants (*, products (*)))`)
      .eq("id", cartId)
      .single();

    if (error || !cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    return NextResponse.json({ cart });
  } catch (error) {
    logError("CartGET", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}
