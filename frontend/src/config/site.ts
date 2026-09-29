import type { NavigationItem } from "@/types/navigation";

const navigation: NavigationItem[] = [
  {
    label: "Services",
    href: "/services/ai",
    children: [
      { label: "AI", href: "/services/ai", description: "Private, auditable RAG assistants and AI automation grounded in your data." },
      { label: "Data", href: "/services/data", description: "Reliable pipelines, ETL, cloud warehousing, analytics, and BI." },
      { label: "Cloud", href: "/services/cloud", description: "Architecture, migration, and cost optimization across AWS, Azure, and GCP." },
      { label: "Others", href: "/services/other", description: "Production-grade backend systems and tailored technical consulting." },
    ],
  },
  {
    label: "Resources",
    href: "/case-studies",
    children: [
      { label: "Case studies", href: "/case-studies", description: "See how we solve practical business challenges." },
      { label: "Blogs", href: "/blog", description: "Ideas, technical guides, and perspectives from our experts." },
    ],
  },
  { label: "Technologies", href: "/technologies" },
  {
    label: "Company",
    href: "/#company",
    children: [
      { label: "About us", href: "/about", description: "Our story, values, and the work that drives us." },
      { label: "Our team", href: "/team", description: "Meet the people behind Vyntics." },
    ],
  },
];

export const siteConfig = {
  name: "Vyntics",
  address: "1st Floor SNJ Co-Work, Sector 26, Pratap Nagar, Jaipur",
  mapHref: "https://www.google.com/maps/search/?api=1&query=1st+Floor+SNJ+Co-Work%2C+Sector+26%2C+Pratap+Nagar%2C+Jaipur",
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/vyntics",
    instagram: "https://www.instagram.com/vyntics/",
    twitter: "https://x.com/vyntics",
  },
  navigation,
} as const;
