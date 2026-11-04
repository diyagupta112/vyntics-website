/* eslint-disable @next/next/no-img-element */
import { Container } from "@/components/ui/container";
import { getLifeAtVyntics } from "@/lib/life-at-vyntics";
import galleryStyles from "@/components/pages/life-at-vyntics.module.css";
import styles from "./life-at-vyntics-preview.module.css";
import { ArrowFillButton } from "@/components/ui/arrow-fill-button";

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
                src={image.image_url}
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
