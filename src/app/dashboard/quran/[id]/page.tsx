"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "~/components/ui/sonner";
import type { Ayah } from "~/types/app";

type Bookmark = {
  id: number;
  ayah_id: number;
  surah_id: number | null;
  ayah_number: number | null;
  ayah_text: string | null;
  label: string | null;
  tags: string | null;
  color: string | null;
  created_at: string;
};

const COLOR_OPTIONS = [
  { value: "", label: "بدون لون" },
  { value: "red", label: "أحمر" },
  { value: "orange", label: "برتقالي" },
  { value: "yellow", label: "أصفر" },
  { value: "green", label: "أخضر" },
  { value: "teal", label: "فيروزي" },
  { value: "blue", label: "أزرق" },
  { value: "purple", label: "بنفسجي" },
  { value: "pink", label: "وردي" },
];

const JUMVAL_LABELS: Record<string, string> = {
  grand_east: "مشرقي كبير",
  grand_west: "مغربي كبير",
  small_east: "مشرقي صغير",
  small_west: "مغربي صغير",
  nafsy: "نفسي",
};

const JUMVAL_COLORS: Record<string, string> = {
  grand_east: "bg-green-600",
  grand_west: "bg-red-600",
  small_east: "bg-blue-500",
  small_west: "bg-gray-500",
  nafsy: "bg-yellow-500",
};

export default function AyahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ayahId = parseInt(id);

  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bmsLoading, setBmsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formLabel, setFormLabel] = useState("");
  const [formColor, setFormColor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetch(`/api/quran/${ayahId}`, { signal: controller.signal }).then(
        (r) => {
          if (!r.ok) throw new Error("فشل تحميل الآية");
          return r.json();
        },
      ),
      fetch(`/api/bookmarks?ayah_id=${ayahId}`, {
        signal: controller.signal,
      }).then((r) => {
        if (r.status === 401) return [];
        return r.json();
      }),
    ])
      .then(([ayahData, bmsData]) => {
        if (!ayahData || !ayahData.id) {
          setError("لم يتم العثور على الآية");
        } else {
          setAyah(ayahData);
        }
        setBookmarks(Array.isArray(bmsData) ? bmsData : []);
        setLoading(false);
        setBmsLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
          setBmsLoading(false);
        }
      });

    return () => controller.abort();
  }, [ayahId]);

  function handleAddBookmark() {
    setSaving(true);
    fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ayah_id: ayahId,
        ayah_text: ayah?.ayah || null,
        surah_id: null,
        ayah_number: null,
        label: formLabel || null,
        color: formColor || null,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("فشل الحفظ");
        return r.json();
      })
      .then((newBm) => {
        setBookmarks((prev) => [newBm, ...prev]);
        toast.success("تمت إضافة العلامة", { duration: 2000 });
        setIsDialogOpen(false);
        setFormLabel("");
        setFormColor("");
      })
      .catch(() => {
        toast.error("فشلت الإضافة", { duration: 2000 });
      })
      .finally(() => setSaving(false));
  }

  function handleDeleteBookmark(bmId: number) {
    if (!window.confirm("هل أنت متأكد من حذف هذه العلامة؟")) return;

    fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bmId }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("فشل الحذف");
        setBookmarks((prev) => prev.filter((b) => b.id !== bmId));
        toast.info("تم الحذف", { duration: 2000 });
      })
      .catch(() => {
        toast.error("فشل الحذف", { duration: 2000 });
      });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">جاري التحميل…</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="mx-auto h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !ayah) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error || "الآية غير موجودة"}</p>
            <div className="mt-4 text-center">
              <Link href="/dashboard/quran">
                <Button variant="outline">
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  العودة إلى القرآن
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBookmarked = bookmarks.length > 0;
  const numBookmarks = bookmarks.length;

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Toaster />

      {/* Back link */}
      <div className="mb-4">
        <Link href="/dashboard/quran">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى القرآن
          </Button>
        </Link>
      </div>

      {/* Ayah card */}
      <Card className="w-full p-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">الآية {ayahId}</CardTitle>
            <Badge variant="outline" className="text-sm">
              رقم {ayahId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-6">
            {/* Arabic text */}
            <div className="rounded-lg bg-slate-800 p-6 text-center">
              <p
                className="text-4xl leading-relaxed text-white"
                style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                dir="rtl"
              >
                {ayah.ayah}
              </p>
            </div>

            {/* Jummal values */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {(["grand_east", "grand_west", "small_east", "small_west", "nafsy"] as const).map(
                (key) => (
                  <div key={key} className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {JUMVAL_LABELS[key]}
                    </p>
                    <Badge
                      className={`${JUMVAL_COLORS[key]} text-white text-sm mt-1`}
                    >
                      {ayah[key]}
                    </Badge>
                  </div>
                ),
              )}
            </div>

            {/* Bookmark section */}
            <div className="border-t pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isBookmarked ? (
                    <BookmarkCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {isBookmarked
                      ? `${numBookmarks} علامة ${numBookmarks === 1 ? "محفوظة" : "محفوظة"}`
                      : "غير محفوظة"}
                  </span>
                </div>

                <div className="flex gap-2">
                  {!isBookmarked && (
                    <Button
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                      size="sm"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Bookmark className="ml-1 h-4 w-4" />
                      إضافة علامة
                    </Button>
                  )}
                </div>
              </div>

              {/* Existing bookmarks list */}
              {bookmarks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className={`flex items-center justify-between rounded-md border p-3 ${
                        bm.color ? `border-l-4` : ""
                      }`}
                      style={
                        bm.color
                          ? { borderLeftColor: `var(--${bm.color}-500, #888)` }
                          : undefined
                      }
                    >
                      <div className="flex flex-col gap-1">
                        {bm.label && (
                          <p className="text-sm font-semibold">{bm.label}</p>
                        )}
                        {bm.tags && (
                          <div className="flex flex-wrap gap-1">
                            {bm.tags.split(",").map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(bm.created_at).toLocaleDateString("ar")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteBookmark(bm.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {bookmarks.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      إضافة علامة أخرى
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add bookmark dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة علامة مرجعية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Ayah preview */}
            <div className="rounded-md bg-slate-100 p-3 text-center dark:bg-slate-800">
              <p
                className="text-xl leading-relaxed"
                style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                dir="rtl"
              >
                {ayah.ayah}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">الوسم</Label>
              <Input
                id="label"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="مثلاً: آية مفضلة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">اللون</Label>
              <Select value={formColor} onValueChange={setFormColor}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر اللون" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white"
              onClick={handleAddBookmark}
              disabled={saving}
            >
              {saving ? "جاري الحفظ…" : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
