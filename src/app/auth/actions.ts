"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "~/utils/supabase/server";

interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  interests?: string[];
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    return { error: "حدث خطأ في تسجيل الدخول" };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function register(input: RegisterInput) {
  if (input.password !== input.confirmPassword) {
    return { success: false, error: "كلمتا المرور غير متطابقتين" };
  }
  if (input.password.length < 6) {
    return { success: false, error: "يجب أن تكون كلمة المرور 6 أحرف على الأقل" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.displayName || "User",
        interests: input.interests || [],
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "البريد الإلكتروني مسجل بالفعل" };
    }
    return { success: false, error: "حدث خطأ في إنشاء الحساب" };
  }

  // Store email for verify-email page
  if (typeof window !== "undefined") {
    sessionStorage.setItem("verify_email", input.email);
  }

  revalidatePath("/", "layout");
  redirect("/auth/welcome");
}
