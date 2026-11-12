import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { getBadges } from "@/lib/badges";
import { RecognitionCarousel } from "@/components/sections/recognitions/recognition-carousel";
import { RecognitionSkeleton } from "@/components/sections/recognitions/recognition-skeleton";
import local from "@/app/(marketing)/recognitions/page.module.css";
import styles from "./home-recognitions.module.css";

function RecognitionsSection({ children }: { children: ReactNode }) {
  return (
    <section className={local.section} aria-labelledby="home-recognitions-title">
      <Container>
        <div className={`${local.sectionHeading} ${styles.heading}`}><p className={local.eyebrow}>OUR RECOGNITIONS AND CERTIFICATIONS</p><h2 id="home-recognitions-title">Our Recognitions and Certifications</h2></div>
        {children}
      </Container>
    </section>
  );
}

export function HomeRecognitionsSkeleton() {
  return <RecognitionsSection><RecognitionSkeleton /></RecognitionsSection>;
}

/** The same badge carousel as the recognitions page, fed by the shared badge request. Hidden when there is nothing to show. */
export async function HomeRecognitions() {
  let badges: Awaited<ReturnType<typeof getBadges>>;
  try {
    badges = await getBadges();
  } catch {
    return null;
  }
  if (badges.length === 0) return null;
  return <RecognitionsSection><RecognitionCarousel badges={badges} /></RecognitionsSection>;
}
