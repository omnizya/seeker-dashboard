import {
  BookOpen,
  Calculator,
  Compass,
  Gem,
  Grid3X3,
  Heart,
  Moon,
  PenLine,
  Bookmark,
  Sparkles,
  Star,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { DefaultText } from "~/texts";
import Footer from "~/components/Footer/appFooter";

const features = [
  { icon: Calculator, key: "jummal" as const },
  { icon: BookOpen, key: "quran" as const },
  { icon: Star, key: "holyNames" as const },
  { icon: Grid3X3, key: "wafq" as const },
  { icon: Compass, key: "prayer" as const },
  { icon: Moon, key: "astro" as const },
  { icon: Gem, key: "tasbih" as const },
  { icon: Bookmark, key: "bookmarks" as const },
  { icon: PenLine, key: "journal" as const },
  { icon: Heart, key: "dua" as const },
  { icon: Sparkles, key: "lodge" as const },
] as const;

export default function LearnMorePage() {
  const { hero, features: featureTexts } = DefaultText.learn;

  return (
    <>
      {/* Hero */}
      <section className="flex w-full bg-[url('/cube.jpg')] bg-cover bg-center bg-fixed">
        <div className="flex w-full items-center justify-center bg-gradient-to-b from-black/60 to-purple-600 px-4 md:px-8">
          <div className="mx-auto max-w-6xl py-20 text-center md:py-28">
            <h1 className="font-uthman drop-shadow-lg shadow-purple-600 text-2xl leading-[150%] text-white sm:text-4xl md:text-6xl">
              {hero.verse}
            </h1>
            <p className="mt-6 text-lg text-white/80">{hero.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <h2 className="font-uthman mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
          الميزات
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, key }) => (
            <Card key={key} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">
                  {featureTexts[key].title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {featureTexts[key].description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
