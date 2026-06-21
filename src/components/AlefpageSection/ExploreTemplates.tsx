"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

type ExploreTemplatesProps = {
  templatesCount: number;
};

export const TEMPLATES_LINK: string = "/alef";

export const ExploreTemplates = ({ templatesCount }: ExploreTemplatesProps) => {
  return (
    <div className="bg-orange-50 dark:bg-gray-800" dir="rtl">
      <div className="max-w-7xl mx-auto py-14 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="bg-orange-400 dark:bg-orange-500 rounded-xl text-white dark:text-gray-100 px-4 md:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Explore {templatesCount - 1}+ Services
              </h3>
              <p className="text-lg">
                and start building beautiful websites & webapps today!
              </p>
            </div>
            <div className="w-full flex items-center justify-center">
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8">
                <Link href={TEMPLATES_LINK} className="flex items-center gap-2">
                  Browse Apps
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
