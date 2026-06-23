"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "~/utils/supabase/server";
import { loginSchema, registerSchema } from "~/schemas/auth";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    return { error: "حدث خطأ في تسجيل الدخول" };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function register(input: {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  interests?: string[];
}) {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName || "المستخدم",
        interests: parsed.data.interests || [],
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "البريد الإلكتروني مسجل بالفعل" };
    }
    return { success: false, error: "حدث خطأ في إنشاء الحساب" };
  }

  revalidatePath("/", "layout");
  redirect("/auth/welcome");
}
