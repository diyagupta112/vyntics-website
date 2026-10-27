import { OptimizedImage } from "@/components/ui/optimized-image";
import { CaseStudyVideo } from "./case-study-video";
import type { CaseStudyMedia as Media } from "@/lib/case-studies";
import styles from "./case-study-media.module.css";

export function CaseStudyMedia({
  media,
  title,
  fallbackSrc,
  priority = false,
  className = "",
}: {
  media: Media;
  title: string;
  fallbackSrc: string;
  priority?: boolean;
  className?: string;
}) {
  if (media.type === "video") {
    return (
      <div className={`${styles.frame} ${className}`.trim()}>
        <CaseStudyVideo media={media} title={title} fallbackSrc={fallbackSrc} controls className={styles.media} />
      </div>
    );
  }

  return (
    <div className={`${styles.frame} ${className}`.trim()}>
      <OptimizedImage
        className={styles.media}
        src={media.src}
        alt={media.alt ?? `${title} project visual`}
        width={1280}
        height={853}
        sizes="(max-width: 1100px) 100vw, 70vw"
        priority={priority}
      />
    </div>
  );
}
