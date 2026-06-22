import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const surahId = request.nextUrl.searchParams.get("surah_id");
    const ayahId = request.nextUrl.searchParams.get("ayah_id");
    let query = supabase
      .schema("spiritual").from("quran_bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (surahId) {
      query = query.eq("surah_id", parseInt(surahId));
    }
    if (ayahId) {
      query = query.eq("ayah_id", parseInt(ayahId));
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Bookmarks API error:", error);
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
    if (!body.ayah_id) {
      return NextResponse.json({ error: "ayah_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .schema("spiritual").from("quran_bookmarks")
      .insert({ ...body, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Bookmarks create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .schema("spiritual").from("quran_bookmarks")
      .select("id, user_id")
      .eq("id", body.id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const { error } = await supabase
      .schema("spiritual").from("quran_bookmarks")
      .delete()
      .eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bookmarks delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
