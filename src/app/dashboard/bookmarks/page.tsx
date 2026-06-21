"use client";

import { useEffect, useState } from "react";
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
  DialogClose,
} from "~/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "~/components/ui/sonner";

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

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLabel, setSearchLabel] = useState("");
  const [filterSurah, setFilterSurah] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [formAyahId, setFormAyahId] = useState("");
  const [formSurahId, setFormSurahId] = useState("");
  const [formAyahNumber, setFormAyahNumber] = useState("");
  const [formAyahText, setFormAyahText] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formColor, setFormColor] = useState("");

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => {
        if (r.status === 401) throw new Error("يرجى تسجيل الدخول أولاً");
        return r.json();
      })
      .then((data) => {
        setBookmarks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const uniqueSurahIds = [
    ...new Set(bookmarks.map((b) => b.surah_id).filter((id): id is number => id != null)),
  ].sort((a, b) => a - b);

  const filtered = bookmarks.filter((b) => {
    const matchesSearch =
      !searchLabel ||
      (b.label && b.label.toLowerCase().includes(searchLabel.toLowerCase()));
    const matchesSurah =
      !filterSurah || String(b.surah_id) === filterSurah;
    return matchesSearch && matchesSurah;
  });

  function handleDelete(id: number) {
    if (!window.confirm("هل أنت متأكد من حذف هذه العلامة المرجعية؟")) return;
    fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("فشل الحذف");
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
        toast.info("تم الحذف", { duration: 2000 });
      })
      .catch(() => {
        toast.error("فشل الحذف", { duration: 2000 });
      });
  }

  function handleAdd() {
    if (!formAyahId) {
      toast.warning("الرجاء إدخال رقم الآية", { duration: 2000 });
      return;
    }
    const body: Record<string, unknown> = { ayah_id: parseInt(formAyahId) };
    if (formSurahId) body.surah_id = parseInt(formSurahId);
    if (formAyahNumber) body.ayah_number = parseInt(formAyahNumber);
    if (formAyahText) body.ayah_text = formAyahText;
    if (formLabel) body.label = formLabel;
    if (formColor) body.color = formColor;

    fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (!r.ok) throw new Error("فشلت الإضافة");
        return r.json();
      })
      .then((newBm) => {
        setBookmarks((prev) => [...prev, newBm]);
        toast.success("تمت الإضافة", { duration: 2000 });
        setIsOpen(false);
        setFormAyahId("");
        setFormSurahId("");
        setFormAyahNumber("");
        setFormAyahText("");
        setFormLabel("");
        setFormColor("");
      })
      .catch(() => {
        toast.error("فشلت الإضافة", { duration: 2000 });
      });
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("ar", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">العلامات المرجعية</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">العلامات المرجعية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <Toaster />
      <Card className="w-full p-4">
        <CardHeader>
          <CardTitle className="text-center text-lg">العلامات المرجعية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white"
              onClick={() => setIsOpen(true)}
            >
              + إضافة علامة مرجعية
            </Button>
            <Input
              placeholder="بحث في الوسم…"
              value={searchLabel}
              onChange={(e) => setSearchLabel(e.target.value)}
              className="max-w-[200px]"
            />
            <Select
              value={filterSurah}
              onValueChange={setFilterSurah}
            >
              <SelectTrigger className="max-w-[200px]">
                <SelectValue placeholder="تصفية بالسورة" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSurahIds.map((sid) => (
                  <SelectItem key={sid} value={String(sid)}>
                    سورة {sid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">
              لا توجد علامات مرجعية بعد. ابدأ بإضافة آية.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((bm) => (
                <Card
                  key={bm.id}
                  className="relative overflow-hidden border"
                >
                  {bm.color && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: `var(--${bm.color}-500, #888)` }}
                    />
                  )}
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-3">
                      {bm.ayah_text && (
                        <p
                          className="text-xl text-right leading-relaxed"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                          dir="rtl"
                        >
                          {bm.ayah_text}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {bm.surah_id != null && (
                          <Badge className="bg-green-500 text-white">
                            سورة {bm.surah_id}
                          </Badge>
                        )}
                        {bm.ayah_number != null && (
                          <Badge className="bg-blue-500 text-white">
                            آية {bm.ayah_number}
                          </Badge>
                        )}
                        {bm.ayah_id != null && (
                          <Badge variant="outline">
                            رقم {bm.ayah_id}
                          </Badge>
                        )}
                        {bm.label && <Badge variant="secondary">{bm.label}</Badge>}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          أضيف في {formatDate(bm.created_at)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(bm.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة علامة مرجعية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ayahId">رقم الآية *</Label>
              <Input
                id="ayahId"
                type="number"
                value={formAyahId}
                onChange={(e) => setFormAyahId(e.target.value)}
                placeholder="رقم الآية"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surahId">رقم السورة</Label>
              <Input
                id="surahId"
                type="number"
                value={formSurahId}
                onChange={(e) => setFormSurahId(e.target.value)}
                placeholder="اختياري"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ayahNumber">رقم الآية في السورة</Label>
              <Input
                id="ayahNumber"
                type="number"
                value={formAyahNumber}
                onChange={(e) => setFormAyahNumber(e.target.value)}
                placeholder="اختياري"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ayahText">نص الآية</Label>
              <Input
                id="ayahText"
                value={formAyahText}
                onChange={(e) => setFormAyahText(e.target.value)}
                placeholder="اختياري - نص الآية"
              />
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
              <Select
                value={formColor}
                onValueChange={setFormColor}
              >
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
            <DialogClose asChild>
              <Button variant="ghost">إلغاء</Button>
            </DialogClose>
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white"
              onClick={handleAdd}
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
