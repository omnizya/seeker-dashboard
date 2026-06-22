import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";
import { duaListCreateSchema, duaEntryCreateSchema } from "~/schemas/dua";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const category = request.nextUrl.searchParams.get("category");

    let listQuery = supabase
      .schema("spiritual").from("dua_lists")
      .select("id, title, description, category, source")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (category) {
      listQuery = listQuery.eq("category", category);
    }

    const { data: lists, error: listError } = await listQuery;
    if (listError) throw listError;
    if (!lists || lists.length === 0) {
      return NextResponse.json({ lists: [] });
    }

    // Fetch entries for all lists
    const listIds = lists.map((l) => l.id);
    const { data: entries, error: entriesError } = await supabase
      .schema("spiritual").from("dua_entries")
      .select("*")
      .in("list_id", listIds)
      .order("sort_order");

    if (entriesError) throw entriesError;

    // Attach entries to their parent lists
    type DuaEntry = NonNullable<typeof entries>[number];
    const entryMap: Record<number, DuaEntry[]> = {};
    if (entries) {
      for (const entry of entries) {
        if (!entryMap[entry.list_id]) entryMap[entry.list_id] = [];
        entryMap[entry.list_id].push(entry);
      }
    }

    const result = (lists as Array<{ id: number; title: string; description: string | null; category: string | null; source: string | null }>).map((list) => ({
      ...list,
      entries: entryMap[list.id] || [],
    }));

    return NextResponse.json({ lists: result });
  } catch (error) {
    console.error("Dua API error:", error);
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
    const { type } = body;

    if (type === "list") {
      const parsed = duaListCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .schema("spiritual").from("dua_lists")
        .insert({ title: parsed.data.name, category: parsed.data.category })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }

    if (type === "entry") {
      const parsed = duaEntryCreateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const insertData: Record<string, unknown> = {
        list_id: parsed.data.list_id,
        title: parsed.data.title,
        arabic: parsed.data.arabic_text,
      };
      if (parsed.data.content) {
        insertData.transliteration = parsed.data.content;
      }

      const { data, error } = await supabase
        .schema("spiritual").from("dua_entries")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Dua API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
