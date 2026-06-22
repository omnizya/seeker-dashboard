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
    dotlessToggle: "حساب بدون نقاط",
    outputTable: {
      title: "الحصيلة",
      tableHeader: {
        east: "مشرقي",
        west: "مغربي",
        nafsy: "نفسي",
      },
    },
  },
  ResonanceMatrixCard: {
    cardTitle: "مصفوفة الرنين",
    seedLabel: "القيمة الأساسية (N)",
    seedPlaceholder: "أدخل رقمًا",
    bLabel: "B",
    rLabel: "R",
    magicConstant: "الثابت السحري",
    isMagic: "مربع سحري",
    notMagic: "ليس مربعًا سحريًا",
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
        e: {
          label: "أوقات الصلاة",
          href: "/dashboard/prayer",
        },
        f: {
          label: "الأوضاع الفلكية",
          href: "/dashboard/astro",
        },
        g: {
          label: "التسبيح",
          href: "/dashboard/tasbih",
        },
        h: {
          label: "العلامات المحفوظة",
          href: "/dashboard/bookmarks",
        },
        i: {
          label: "اليوميات",
          href: "/dashboard/journal",
        },
        j: {
          label: "الأدعية",
          href: "/dashboard/dua",
        },
      },
    },
  },
  PlanetaryHours: {
    cardTitle: "الساعات الكوكبية",
    dayLabel: "النهار",
    nightLabel: "الليل",
    planets: {
      Saturn: "زحل",
      Jupiter: "المشتري",
      Mars: "المريخ",
      Sun: "الشمس",
      Venus: "الزهرة",
      Mercury: "عطارد",
      Moon: "القمر",
    },
  },
  learn: {
    hero: {
      verse:
        "وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا ۖ وَذَرُوا الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ ۚ سَيُجْزَوْنَ مَا كَانُوا يَعْمَلُونَ",
      title: "الباحث",
      subtitle: "المنصة الخاصة بالعلوم الروحانية",
    },
    nav: {
      home: "الرئيسية",
      dashboard: "لوحة التحكم",
    },
    features: {
      jummal: {
        title: "حساب الجُمَّل",
        description:
          "تحويل النصوص العربية إلى قيم عددية باستخدام أنظمة الحساب الأبجدي",
      },
      quran: {
        title: "القرءان الكريم",
        description:
          "تصفح الآيات مع القيم العددية والإشارة إلى الأسماء الحسنى",
      },
      holyNames: {
        title: "الأسماء الحسنى",
        description: "جدول الأسماء الحسنى التسعين مع خصائصها ومعانيها",
      },
      wafq: {
        title: "الأوفاق",
        description: "توليد المربعات السحرية ثلاثية الأبعاد بالعناصر الأربعة",
      },
      prayer: {
        title: "أوقات الصلاة",
        description:
          "حساب أوقات الصلوات الخمس حسب الموقع والطريقة الحسابية",
      },
      astro: {
        title: "الأوضاع الفلكية",
        description: "اتجاه القبلة وطور القمر وبيانات الشمس",
      },
      tasbih: {
        title: "التسبيح",
        description:
          "عدّاد الذكر التفاعلي مع presets جاهزة وإحصائيات يومية",
      },
      bookmarks: {
        title: "العلامات المحفوظة",
        description:
          "حفظ وتنظيم آيات القرآن المعروفة بألوان وتسميات",
      },
      journal: {
        title: "اليوميات الروحانية",
        description:
          "تدوين الملاحظات والتجارب الروحية مع تصنيفات ومزاج",
      },
      dua: {
        title: "الأدعية",
        description:
          "مكتبة الأدعية منظمة حسب الفئات مع النطق والترجمة",
      },
      lodge: {
        title: "بروتوكول اللودج",
        description:
          "إطار حاسوبي لترميز النية ومحاذاة الوقت وبناء العادات",
      },
    },
  },
};

export type DefaultTextT = typeof DefaultText;
