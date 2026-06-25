"use client";

import { useState } from "react";
import useSWR from "swr";
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
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
import { useJournalStore } from "~/stores/journalStore";
import { api } from "~/lib/api";
import type { JournalEntryCreateInput, JournalEntryUpdateInput } from "~/schemas/journal";

type JournalEntry = {
  id: number;
  entry_date: string;
  title: string | null;
  content: string;
  entry_type: string;
  mood: string | null;
  tags: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

const ENTRY_TYPES: Record<string, string> = {
  reflection: "تأمل",
  dream: "رؤيا",
  gratitude: "شكر",
  goal: "هدف روحي",
  lesson: "درس",
  prayer: "دعاء",
  custom: "مخصص",
};

const MOOD_OPTIONS: Record<string, string> = {
  happy: "سعيد",
  calm: "هادئ",
  sad: "حزين",
  anxious: "قلق",
  grateful: "شاكر",
  reflective: "متأمل",
};

const TYPE_COLORS: Record<string, string> = {
  reflection: "bg-purple-500",
  dream: "bg-blue-500",
  gratitude: "bg-green-500",
  goal: "bg-orange-500",
  lesson: "bg-yellow-500",
  prayer: "bg-teal-500",
  custom: "bg-gray-500",
};

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  sad: "😢",
  anxious: "😰",
  grateful: "🤲",
  reflective: "🤔",
};

function fetchJournal() {
  return api.get<JournalEntry[]>("/api/journal");
}

export default function JournalPage() {
  const { addEntry, updateEntry, deleteEntry } = useJournalStore();
  const [tabValue, setTabValue] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formType, setFormType] = useState("reflection");
  const [formMood, setFormMood] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formIsPrivate, setFormIsPrivate] = useState(false);

  const { data: entries = [], isLoading, error } = useSWR(
    "/api/journal",
    fetchJournal,
    { revalidateOnFocus: false },
  );

  const typeKeys = Object.keys(ENTRY_TYPES);
  const selectedType = tabValue === "all" ? null : tabValue;

  const filtered = selectedType
    ? entries.filter((e) => e.entry_type === selectedType)
    : entries;

  function openCreate() {
    setEditingId(null);
    setFormTitle("");
    setFormContent("");
    setFormType("reflection");
    setFormMood("");
    setFormTags("");
    setFormIsPrivate(false);
    setIsOpen(true);
  }

  function openEdit(entry: JournalEntry) {
    setEditingId(entry.id);
    setFormTitle(entry.title || "");
    setFormContent(entry.content);
    setFormType(entry.entry_type);
    setFormMood(entry.mood || "");
    setFormTags(entry.tags || "");
    setFormIsPrivate(entry.is_private);
    setIsOpen(true);
  }

  function handleSave() {
    if (!formContent.trim()) {
      toast.warning("المحتوى مطلوب", { duration: 2000 });
      return;
    }
    const tags = formTags
      ? formTags.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined;

    const result = editingId != null
      ? updateEntry({
          id: editingId,
          title: formTitle || undefined,
          content: formContent,
          mood: (formMood || undefined) as JournalEntryUpdateInput["mood"],
          tags,
        })
      : addEntry({
          title: formTitle || "بدون عنوان",
          content: formContent,
          mood: (formMood || undefined) as JournalEntryCreateInput["mood"],
          tags,
        });

    result.then((res) => {
      if (res.success) {
        toast.success(editingId != null ? "تم التحديث" : "تم الحفظ", { duration: 2000 });
        setIsOpen(false);
      } else {
        toast.error(res.error || "فشل الحفظ", { duration: 2000 });
      }
    });
  }

  function handleDelete(id: number) {
    if (!window.confirm("هل أنت متأكد من حذف هذه التدوينة؟")) return;
    deleteEntry(id).then((res) => {
      if (res.success) {
        toast.info("تم الحذف", { duration: 2000 });
      } else {
        toast.error(res.error || "فشل الحذف", { duration: 2000 });
      }
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

  function getTitle(entry: JournalEntry): string {
    if (entry.title) return entry.title;
    const first50 = entry.content.slice(0, 50);
    return first50.length < entry.content.length ? first50 + "…" : first50;
  }

  function getPreview(content: string): string {
    if (content.length <= 100) return content;
    return content.slice(0, 100) + "…";
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-4">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-center">التدوينات الروحانية</CardTitle>
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
            <CardTitle className="text-center">التدوينات الروحانية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-red-500">{error.message}</p>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">التدوينات الروحانية</CardTitle>
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white"
              onClick={openCreate}
            >
              + تدوينة جديدة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tabValue} onValueChange={setTabValue} className="mb-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">الكل</TabsTrigger>
              {typeKeys.map((key) => (
                <TabsTrigger key={key} value={key}>{ENTRY_TYPES[key]}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground">
              لا توجد تدوينات بعد. اكتب أول تدوينة لك.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((entry) => (
                <Card key={entry.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`${TYPE_COLORS[entry.entry_type] || "bg-gray-500"} text-white text-sm px-2 py-1`}>
                          {ENTRY_TYPES[entry.entry_type] || entry.entry_type}
                        </Badge>
                        {entry.mood && MOOD_EMOJI[entry.mood] && (
                          <p className="text-xl">{MOOD_EMOJI[entry.mood]}</p>
                        )}
                      </div>
                      <p className="text-sm font-semibold">{getTitle(entry)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)} — أنت
                      </p>
                      <p className="text-sm line-clamp-3">
                        {getPreview(entry.content)}
                      </p>
                      {entry.tags && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.split(",").map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="px-6 pb-4 pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(entry)}
                      >
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(entry.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId != null ? "تعديل التدوينة" : "تدوينة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="اختياري"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">المحتوى *</Label>
              <Textarea
                id="content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="اكتب تدوينتك هنا…"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">النوع</Label>
              <Select
                value={formType}
                onValueChange={setFormType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENTRY_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">المزاج</Label>
              <Select
                value={formMood}
                onValueChange={setFormMood}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المزاج" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MOOD_OPTIONS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {MOOD_EMOJI[key] || ""} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">الوسوم (مفصولة بفواصل)</Label>
              <Input
                id="tags"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="ذكر، صلاة، تأمل"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="private"
                checked={formIsPrivate}
                onCheckedChange={(checked) => setFormIsPrivate(checked === true)}
              />
              <Label htmlFor="private">خاص</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">إلغاء</Button>
            </DialogClose>
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white"
              onClick={handleSave}
            >
              {editingId != null ? "تحديث" : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
