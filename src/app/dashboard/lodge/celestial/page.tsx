"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import CelestialBadge from "~/components/Lodge/CelestialBadge";
import ElementIndicator from "~/components/Lodge/ElementIndicator";

// Symbolic UI — planetary hours are creative metaphors, not astronomical data
const PLANETS = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"] as const;

const PLANET_DOMAINS: Record<string, string> = {
  SUN: "الإلهام والقيادة",
  MOON: "الحدس والتأمل",
  MARS: "القوة والتصميم",
  MERCURY: "التعلم والتواصل",
  JUPITER: "الحكمة والتوسع",
  VENUS: "الجمال والتناغم",
  SATURN: "الانضباط والصبر",
};

const ELEMENT_NAMES: Record<number, string> = {
  0: "الأرض — الاستقرار",
  1: "الماء — الاندفاع",
  2: "الهواء — المرونة",
  3: "النار — الحماس",
};

const LUNAR_MANSIONS: { name: string; meaning: string }[] = [
  { name: "الثريا", meaning: "التجمع" },
  { name: "الدبران", meaning: "الإنجاز" },
  { name: "الديباج", meaning: "الفخامة" },
  { name: "المغرم", meaning: "الهوى" },
  { name: "القلب", meaning: "العمق" },
  { name: "الشولة", meaning: "القوس" },
  { name: "النعيم", meaning: "اللذة" },
  { name: "البلدة", meaning: "المكان" },
  { name: "سعد الذابح", meaning: "التضحية" },
  { name: "سعد بلع", meaning: "الفتح" },
  { name: "سعد السعود", meaning: "الحظ" },
  { name: "سعد الخبايا", meaning: "الرخاء" },
  { name: "المقدم", meaning: "التقديم" },
  { name: "المؤخر", meaning: "الإتمام" },
  { name: "الرشا", meaning: "المطر" },
  { name: "الزوراء", meaning: "الماء" },
  { name: "السماك", meaning: "السماء" },
  { name: "الغفر", meaning: "المغفرة" },
  { name: "الزبانى", meaning: "الانضباط" },
  { name: "الإكليل", meaning: "التتويج" },
  { name: "المفرّح", meaning: "السرور" },
  { name: "البروق", meaning: "الضوء" },
  { name: "البرع", meaning: "البريق" },
  { name: "السرطان", meaning: "الدفاع" },
  { name: "النعائم", meaning: "النقاء" },
  { name: "السادة", meaning: "السيادة" },
  { name: "المتقن", meaning: "الإتقان" },
  { name: "الذؤابة", meaning: "التربية" },
];

function getCurrentPlanetaryHour(): number {
  const hour = new Date().getHours();
  return Math.floor(hour / 3.428) % 7;
}

function getCurrentLunarMansion(): number {
  const day = new Date().getDate();
  return (day - 1) % 28;
}

function getCurrentElement(): number {
  const hour = new Date().getHours();
  return Math.floor(hour / 6) % 4;
}

export default function CelestialPage() {
  const [planetIndex, setPlanetIndex] = useState(getCurrentPlanetaryHour);
  const [mansionIndex, setMansionIndex] = useState(getCurrentLunarMansion);
  const [elementIndex, setElementIndex] = useState(getCurrentElement);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlanetIndex(getCurrentPlanetaryHour());
      setMansionIndex(getCurrentLunarMansion());
      setElementIndex(getCurrentElement());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const currentPlanet = PLANETS[planetIndex];
  const currentMansion = LUNAR_MANSIONS[mansionIndex];

  return (
    <div className="mx-auto max-w-xl space-y-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Celestial Layer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Planetary Hour
            </h3>
            <CelestialBadge planet={currentPlanet} />
            <p className="text-xs text-muted-foreground">
              {PLANET_DOMAINS[currentPlanet]}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Element Affinity
            </h3>
            <ElementIndicator element={elementIndex} />
            <p className="text-xs text-muted-foreground">
              {ELEMENT_NAMES[elementIndex]}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Lunar Mansion ({mansionIndex + 1}/28)
            </h3>
            <p className="text-sm font-medium">{currentMansion.name}</p>
            <p className="text-xs text-muted-foreground">
              {currentMansion.meaning}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Celestial Domains
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {PLANETS.map((planet) => (
                <div
                  key={planet}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <CelestialBadge planet={planet} />
                  <span className="text-xs text-muted-foreground">
                    {PLANET_DOMAINS[planet]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
