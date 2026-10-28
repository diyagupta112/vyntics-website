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
      { label: "Recognitions", href: "/recognitions", description: "Explore the milestones and contributions we recognize." },
      { label: "Contact us", href: "/contact-us", description: "Tell us about your project or question." },
    ],
  },
];

export const siteConfig = {
  name: "Vyntics",
  address: "1st Floor, 267/10, near Ayush Bhawan, Sector 26, Pratap Nagar, Jaipur, Rajasthan 302033",
  // The Vyntics Google Maps listing. The place ID and coordinates keep Google from resolving the address to the neighboring coworking space.
  location: { name: "Vyntics", placeId: "ChIJPxXmLXQ9yGsRi7ahlxwASuc", latitude: 26.8060867, longitude: 75.8418172 },
  mapHref: "https://www.google.com/maps/search/?api=1&query=Vyntics&query_place_id=ChIJPxXmLXQ9yGsRi7ahlxwASuc",
  socialLinks: {
    linkedin: "https://www.linkedin.com/company/vyntics",
    instagram: "https://www.instagram.com/vyntics/",
    twitter: "https://x.com/vyntics",
    youtube: "https://www.youtube.com/@VynticsTech",
  },
  navigation,
} as const;
