import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { signupSchema } from "@/lib/validations";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);

    // Check for existing user
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert({ email, password: hashedPassword, name: name ?? null })
      .select("id, email, name")
      .single();

    if (error) throw error;

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    logError("SignupRoute", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
