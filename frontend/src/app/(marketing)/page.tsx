import type { Metadata } from "next";
import { Suspense } from "react";
import { getBlogs } from "@/lib/blogs";
import { getBadges } from "@/lib/badges";
import { getTestimonials } from "@/lib/testimonials";
import { Approach } from "@/components/sections/home/approach";
import { BlogShowcase } from "@/components/sections/home/blog-showcase";
import { Capabilities } from "@/components/sections/home/capabilities";
import { ClientMarquee } from "@/components/sections/home/client-marquee";
import { ContactCta } from "@/components/sections/home/contact-cta";
import { FeaturedWork } from "@/components/sections/home/featured-work";
import { Hero } from "@/components/sections/home/hero";
import { HomeRecognitions, HomeRecognitionsSkeleton } from "@/components/sections/home/home-recognitions";
import { Testimonials } from "@/components/sections/home/testimonials";
import { WhyVyntics } from "@/components/sections/home/why-vyntics";
import { LifeAtVynticsPreview } from "@/components/sections/home/life-at-vyntics-preview";
import { SeeItWorking } from "@/components/sections/home/see-it-working";
import mobileStyles from "./home-mobile.module.css";

export const metadata: Metadata = {
  // absolute skips the root "%s | Vyntics" template, which would append the brand twice.
  title: { absolute: "Vyntics | Custom AI, Data & Cloud Solutions" },
  description: "Vyntics delivers custom AI, data engineering, analytics, cloud, and CRM solutions that help businesses turn complex problems into impactful outcomes.",
};

async function LatestBlogs() {
  const result = await getBlogs();
  return <BlogShowcase blogs={result.blogs.slice(0, 5)} unavailable={result.status === "error"} />;
}

async function HomeTestimonials() {
  return <Testimonials testimonials={await getTestimonials()} />;
}

async function HomeServices() {
  const badges = await getBadges().catch(() => []);
  return <Capabilities linkCards badges={badges} />;
}

export default function HomePage() {
  return (
    <div data-home-page className={mobileStyles.page}>
      <Hero />
      <ClientMarquee />
      <Suspense fallback={<HomeRecognitionsSkeleton />}><HomeRecognitions /></Suspense>
      <SeeItWorking />
      <Suspense fallback={<Capabilities linkCards />}><HomeServices /></Suspense>
      <Suspense fallback={<FeaturedWork loading eyebrow="Case studies" description="We build production AI and data systems that are accurate, useful, and ready to ship. Here's what that looks like in practice" expanded />}><FeaturedWork eyebrow="Case studies" description="We build production AI and data systems that are accurate, useful, and ready to ship. Here's what that looks like in practice" expanded /></Suspense>
      <Suspense fallback={null}><HomeTestimonials /></Suspense>
      <Approach />
      <Suspense fallback={<BlogShowcase blogs={[]} loading />}><LatestBlogs /></Suspense>
      <WhyVyntics />
      <Suspense fallback={null}><LifeAtVynticsPreview /></Suspense>
      <ContactCta />
    </div>
  );
}
