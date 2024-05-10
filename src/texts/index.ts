export const DefaultText = {
  app: {
    title: "الباحث",
    description: "المنصة الخاصة بالعلوم الروحانية",
  },
  landingPage: {
    title: "",
    leadingText: "",
    callToActions: {
      learnMore: "التعرف على المزيد",
      getStarted: " بدء الاستخدام",
    },
  },
  JummalCard: {
    cardTitle: "حساب الجُمَّل",
    textAreaPlaceholder: "المرجو إدخال النص",
    outputTable: {
      title: "الحصيلة",
      tableHeader: {
        east: "مشرقي",
        west: "مغربي",
        nafsy: "نفسي",
      },
    },
  },
  dashboard: {
    navbar: {
      links: {
        a: {
          label: "حساب الجمل",
          href: "/dashboard",
        },
        b: {
          label: "القرءان الكريم",
          href: "/dashboard/quran",
        },
        c: {
          label: "الأسماء الحسنى",
          href: "/dashboard/holy-names",
        },
        d: {
          label: "الأوفاق",
          href: "/dashboard/squares",
        },
      },
    },
  },
};

export type DefaultTextT = typeof DefaultText;
