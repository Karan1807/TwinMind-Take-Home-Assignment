import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getServerSupabaseClient } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, lastname } = body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string" ||
      typeof lastname !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 },
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabaseClient();

    // Check if user already exists
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      // PGRST116 is "No rows found"
      console.error("Supabase existing user error:", existingError);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 },
      );
    }

    const { salt, passwordHash } = await hashPassword(password);

    const { data: inserted, error: insertError } = await supabase
      .from("users")
      .insert({
        email: trimmedEmail,
        password_hash: passwordHash,
        salt,
        name: name.trim(),
        lastname: lastname.trim(),
      })
      .select("id, email, name, lastname, created_at")
      .single();

    if (insertError) {
      console.error("Supabase insert user error:", insertError);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        user: inserted,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


