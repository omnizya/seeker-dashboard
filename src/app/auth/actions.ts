"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "~/utils/supabase/server";
import { loginSchema, registerSchema } from "~/schemas/auth";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    return { error: "حدث خطأ في تسجيل الدخول" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("password"),
    displayName: formData.get("displayName") || "User",
    interests: JSON.parse((formData.get("interests") as string) || "[]"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
        interests: parsed.data.interests,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "البريد الإلكتروني مسجل بالفعل" };
    }
    return { error: "حدث خطأ في إنشاء الحساب" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
