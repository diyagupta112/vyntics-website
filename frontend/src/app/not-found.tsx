import type { Metadata } from "next";
import Link from "next/link";
import { preconnect, preload } from "react-dom";
import { OpticalHeadingAlignment } from "@/components/layout/optical-heading-alignment";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeaderBadges } from "@/components/layout/header-badges";
import { SiteHeader, SiteHeaderSpacer } from "@/components/layout/site-header";
import { SplineScene } from "@/components/ui/spline-scene";
import styles from "./not-found.module.css";

const NOT_FOUND_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you're looking for could not be found. Explore Vyntics services, insights, case studies, and more.",
};

export default function NotFound() {
  // Start fetching the scene while the page renders instead of after hydration.
  preconnect("https://prod.spline.design");
  preload(NOT_FOUND_SCENE, { as: "fetch", crossOrigin: "anonymous" });

  return (
    <>
      <OpticalHeadingAlignment />
      <SiteHeader badges={<HeaderBadges />} mobileBadges={<HeaderBadges variant="drawer" />} />
      <SiteHeaderSpacer />
      <main>
        <section>
          <SplineScene scene={NOT_FOUND_SCENE} className={styles.hero}>
            <div className={styles.copy}>
              <p className={styles.eyebrowCode}>404</p>
              <h1 className={styles.title}>Page not found.</h1>
              <p className={styles.text}>
                The page you&apos;re looking for may have moved, been removed, or never existed.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primary} href="/">
                  Back to Home
                </Link>
                <Link className={styles.secondary} href="/services/data">
                  Explore Data Solutions
                </Link>
              </div>
            </div>
          </SplineScene>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
