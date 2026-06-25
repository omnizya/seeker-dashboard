"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuthStore } from "~/stores/authStore";
import { api } from "~/lib/api";

export default function UserProfileEdit() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const authUser = useAuthStore.getState().user;
      if (!authUser) return;

      setUserId(authUser.id);
      setEmail(authUser.email ?? "");

      try {
        const profile = await api.get<{ display_name?: string; avatar_url?: string }>(
          `/api/users/${authUser.id}`
        );
        if (profile) {
          setDisplayName(profile.display_name ?? "");
          setAvatarUrl(profile.avatar_url ?? null);
        }
      } catch {
        // Profile not found — use defaults
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setMessage(null);

    try {
      await api.put(`/api/users/${userId}`, {
        displayName,
        avatarUrl,
      });
      setMessage({ type: "success", text: "تم حفظ التغييرات بنجاح" });
    } catch {
      setMessage({ type: "error", text: "حدث خطأ أثناء الحفظ" });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">
            الملف الشخصي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="space-y-2">
            <Label>الصورة الشخصية</Label>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback>{initials || "م"}</AvatarFallback>
              </Avatar>
              <Input
                placeholder="رابط الصورة (اختياري)"
                value={avatarUrl ?? ""}
                onChange={(e) => setAvatarUrl(e.target.value || null)}
              />
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">اسم العرض</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="اسمك"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="opacity-60"
            />
          </div>

          {/* Status message */}
          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-500" : "text-destructive"
              }`}
            >
              {message.text}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              إلغاء
            </Button>
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </span>
              ) : (
                "حفظ"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
