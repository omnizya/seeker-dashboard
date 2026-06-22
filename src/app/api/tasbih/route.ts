import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";
import { tasbihSessionCreateSchema } from "~/schemas/tasbih";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [presets, sessions, totalResult] = await Promise.all([
      supabase.schema("spiritual").from("tasbih_presets").select("*").order("sort_order"),
      supabase
        .schema("spiritual").from("tasbih_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(50),
      supabase
        .schema("spiritual").from("tasbih_sessions")
        .select("completed_count")
        .eq("user_id", user.id)
        .gte("started_at", todayISO),
    ]);

    if (presets.error) throw presets.error;
    if (sessions.error) throw sessions.error;
    if (totalResult.error) throw totalResult.error;

    const total_count = totalResult.data?.reduce(
      (sum, s) => sum + (s.completed_count || 0),
      0,
    ) ?? 0;

    return NextResponse.json({ presets: presets.data, sessions: sessions.data, total_count });
  } catch (error) {
    console.error("Tasbih API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = tasbihSessionCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .schema("spiritual").from("tasbih_sessions")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Tasbih create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
