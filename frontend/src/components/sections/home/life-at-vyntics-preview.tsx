/* eslint-disable @next/next/no-img-element */
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { getLifeAtVyntics } from "@/lib/life-at-vyntics";
import { coverImgProps } from "@/lib/cover-image";
import galleryStyles from "@/components/pages/life-at-vyntics.module.css";
import styles from "./life-at-vyntics-preview.module.css";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";

/** Same section, heading and three-photo row as the loaded preview. Hidden again if the gallery turns out to be empty. */
export function LifeAtVynticsPreviewSkeleton() {
  return (
    <section className={galleryStyles.section} aria-hidden="true">
      <Container>
        <header className={galleryStyles.heading}>
          <h2>Life at Vyntics</h2>
          <p className={galleryStyles.intro}>Offsites, celebrations and everyday moments from the team</p>
        </header>
        <div className={styles.photos}>
          {[0, 1, 2].map((index) => <figure className={styles.photo} key={index}><Skeleton style={{ width: "100%", height: "100%", borderRadius: 0 }} /></figure>)}
        </div>
      </Container>
    </section>
  );
}

export async function LifeAtVynticsPreview() {
  const galleryImages = await getLifeAtVyntics();
  const seenPhotos = new Set<string>();
  const uniqueImages = galleryImages
    .filter((image) => {
      if (seenPhotos.has(image.image_url)) return false;
      seenPhotos.add(image.image_url);
      return true;
    });
  const images = uniqueImages.slice(0, 3);
  const seventhPhoto = galleryImages[6];
  if (seventhPhoto && !images.slice(0, 2).some((image) => image.image_url === seventhPhoto.image_url)) {
    images[2] = seventhPhoto;
  }
  if (!images.length) return null;
  if (images.length >= 2) {
    [images[0], images[1]] = [images[1], images[0]];
  }

  return (
    <section id="life-at-vyntics-preview" className={galleryStyles.section} aria-labelledby="life-preview-title">
      <Container>
        <header className={galleryStyles.heading}>
          <h2 id="life-preview-title">Life at Vyntics</h2>
          <p className={galleryStyles.intro}>Offsites, celebrations and everyday moments from the team</p>
        </header>
        <div className={styles.photos}>
          {images.map((image, index) => (
            <figure className={styles.photo} key={image.id}>
              <img
                {...coverImgProps(image.image_url, "(max-width: 720px) 100vw, 400px", 640, 480)}
                alt={`Life at Vyntics, team moment ${index + 1}`}
                loading="lazy"
                decoding="async"
                width={640}
                height={480}
              />
            </figure>
          ))}
        </div>
        <div className={galleryStyles.more}>
          <ArrowFillButton className={galleryStyles.moreButton} href="/about#life-at-vyntics">Explore Life at Vyntics</ArrowFillButton>
        </div>
      </Container>
    </section>
  );
}
