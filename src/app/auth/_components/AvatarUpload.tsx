"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Camera, X } from "lucide-react";
import { Image } from "@radix-ui/react-avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface AvatarUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
}

export default function AvatarUpload({
  value,
  onChange,
  className,
}: AvatarUploadProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        onClick={() => fileRef.current?.click()}
        className={cn(
          "relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
          value
            ? "border-primary"
            : "border-muted-foreground/30 hover:border-primary/50",
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="الصورة الشخصية"
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Camera className="h-8 w-8 text-muted-foreground/50" />
        )}
      </div>
      <Input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <p className="text-xs text-muted-foreground">
        {value ? "انقر لتغيير الصورة" : "انقر لرفع صورة شخصية"}
      </p>
    </div>
  );
}
