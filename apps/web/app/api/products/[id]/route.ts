import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";
import { logError } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select(`*, product_variants (*, inventory_items (*)), product_categories (categories (*)), product_tags (tags (*))`)
      .eq("id", params.id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    logError("ProductGET", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.title !== undefined) updates.title = body.title;
    if (body.handle !== undefined) updates.handle = body.handle;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;

    const { data: product, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", params.id)
      .select(`*, product_variants (*, inventory_items (*))`)
      .single();

    if (error) throw error;
    return NextResponse.json({ product });
  } catch (error) {
    logError("ProductPATCH", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase.from("products").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    logError("ProductDELETE", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
