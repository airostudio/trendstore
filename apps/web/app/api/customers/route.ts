import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";
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

    if (!tenant) return NextResponse.json({ customers: [] });

    const { data: customers, error } = await supabase
      .from("customers")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ customers: customers ?? [] });
  } catch (error) {
    logError("CustomersGET", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
