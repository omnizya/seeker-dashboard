"use server";

import { track } from "@vercel/analytics/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "~/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    return { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" };
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    return { error: "حدث خطأ في تسجيل الدخول" };
  }

  track("Login", { location: "Auth Page" });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    return { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور" };
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "البريد الإلكتروني مسجل بالفعل" };
    }
    return { error: "حدث خطأ في إنشاء الحساب" };
  }

  track("SignUp", { location: "Auth Page" });

  // Store email for verify-email page
  // Note: this is a workaround since server actions can't pass data to client state

  revalidatePath("/", "layout");
  redirect("/auth/verify-email");
}
