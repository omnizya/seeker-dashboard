import { NextResponse } from "next/server";
import { createClient } from "~/utils/supabase/server";
import { loginSchema } from "~/schemas/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.includes("Invalid login")) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "حدث خطأ في تسجيل الدخول" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
