import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";
import {
  journalEntryCreateSchema,
  journalEntryUpdateSchema,
  journalEntryDeleteSchema,
} from "~/schemas/journal";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entryType = request.nextUrl.searchParams.get("entry_type");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    let query = supabase
      .schema("spiritual").from("spiritual_journal")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (entryType) {
      query = query.eq("entry_type", entryType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Journal API error:", error);
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
    const parsed = journalEntryCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .schema("spiritual").from("spiritual_journal")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Journal create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = journalEntryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .schema("spiritual").from("spiritual_journal")
      .select("id, user_id")
      .eq("id", parsed.data.id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const { id, ...updates } = parsed.data;
    const { data, error } = await supabase
      .schema("spiritual").from("spiritual_journal")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Journal update error:", error);
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
    const parsed = journalEntryDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .schema("spiritual").from("spiritual_journal")
      .select("id, user_id")
      .eq("id", parsed.data.id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const { error } = await supabase
      .schema("spiritual").from("spiritual_journal")
      .delete()
      .eq("id", parsed.data.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Journal delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
