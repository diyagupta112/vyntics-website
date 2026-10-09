import type { NavigationItem } from "@/types/navigation";
import { serviceNavigation } from "@/content/service-navigation";

const navigation: NavigationItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/#services",
    children: serviceNavigation,
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
    href: "/about",
    children: [
      { label: "About us", href: "/about", description: "Our story, values, and the work that drives us." },
      { label: "Careers", href: "/careers", description: "Build useful systems and grow with the Vyntics team." },
      { label: "Recognition", href: "/recognition", description: "Explore the milestones and contributions we recognize." },
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
    youtube: "https://www.youtube.com/@VynticsTech",
  },
  navigation,
} as const;
