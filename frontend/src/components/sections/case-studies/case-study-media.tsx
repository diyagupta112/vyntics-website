/* eslint-disable @next/next/no-img-element */
import type { CaseStudyMedia as Media } from "@/lib/case-studies";
import styles from "./case-study-media.module.css";

export function CaseStudyMedia({
  media,
  title,
  priority = false,
  className = "",
}: {
  media: Media;
  title: string;
  priority?: boolean;
  className?: string;
}) {
  if (media.type === "video") {
    return (
      <div className={`${styles.frame} ${className}`.trim()}>
        <video
          className={styles.media}
          controls
          playsInline
          preload="metadata"
          poster={media.poster}
          aria-label={`${title} product demonstration`}
        >
          <source src={media.src} />
          Your browser does not support this project video.
        </video>
      </div>
    );
  }

  return (
    <div className={`${styles.frame} ${className}`.trim()}>
      <img
        className={styles.media}
        src={media.src}
        alt={media.alt ?? `${title} project visual`}
        width="1280"
        height="853"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}
