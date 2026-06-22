import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";

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
