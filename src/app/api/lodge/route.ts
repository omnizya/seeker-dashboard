import { NextRequest, NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";
import { LodgeService } from "~/engine";
import type { ArchetypeName } from "~/engine";

const lodge = new LodgeService();

type PostAction =
  | { action: "start"; intent: string; archetype?: ArchetypeName; element?: number }
  | { action: "state" }
  | { action: "transition"; to: string }
  | { action: "yield"; durationTicks: number; interruptions: number; resonance: boolean }
  | { action: "resonance"; cells: number[]; completion: number; threshold?: number };

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = lodge.getSession();
    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 404 });
    }

    return NextResponse.json({ session, state: lodge.getState() });
  } catch (error) {
    console.error("Lodge GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PostAction = await request.json();

    switch (body.action) {
      case "start": {
        if (!body.intent) {
          return NextResponse.json({ error: "intent is required" }, { status: 400 });
        }
        const session = lodge.startSession(
          user.id,
          body.intent,
          body.archetype,
          body.element as 0 | 1 | 2 | 3 | undefined,
        );
        return NextResponse.json({ session, state: lodge.getState() }, { status: 201 });
      }

      case "state": {
        return NextResponse.json({ state: lodge.getState() });
      }

      case "transition": {
        if (!body.to) {
          return NextResponse.json({ error: "to is required" }, { status: 400 });
        }
        const valid = lodge.transitionState(body.to as Parameters<LodgeService["transitionState"]>[0]);
        if (!valid) {
          return NextResponse.json({ error: "Invalid transition" }, { status: 400 });
        }
        return NextResponse.json({ state: lodge.getState() });
      }

      case "yield": {
        if (body.durationTicks == null || body.interruptions == null || body.resonance == null) {
          return NextResponse.json(
            { error: "durationTicks, interruptions, and resonance are required" },
            { status: 400 },
          );
        }
        const result = lodge.calculateYield(body.durationTicks, body.interruptions, body.resonance);
        return NextResponse.json({ yield: result });
      }

      case "resonance": {
        if (!body.cells || body.completion == null) {
          return NextResponse.json({ error: "cells and completion are required" }, { status: 400 });
        }
        const result = lodge.checkResonance(body.cells, body.completion, body.threshold);
        return NextResponse.json({ resonance: result });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Lodge POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
