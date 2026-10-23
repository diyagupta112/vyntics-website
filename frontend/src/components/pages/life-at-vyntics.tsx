import { Container } from "@/components/ui/container";
import { getLifeAtVyntics } from "@/lib/life-at-vyntics";
import { LifeAtVynticsGallery, LifeAtVynticsSkeletonCollage } from "./life-at-vyntics-gallery";
import styles from "./life-at-vyntics.module.css";

/** Subtle placeholder shown while the gallery request is in flight. */
export function LifeAtVynticsSkeleton() {
  return <section className={styles.section} aria-hidden="true">
    <Container><div className={styles.gallery}><LifeAtVynticsSkeletonCollage /></div></Container>
  </section>;
}

export async function LifeAtVyntics() {
  const images = await getLifeAtVyntics();
  if (!images.length) return null;

  return <section id="life-at-vyntics" className={styles.section} aria-labelledby="life-at-vyntics-title">
    <Container>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Life at Vyntics</p>
        <h2 id="life-at-vyntics-title">The people behind the work, beyond the work.</h2>
        <p className={styles.intro}>Offsites, celebrations and everyday moments from the team.</p>
      </header>
      <LifeAtVynticsGallery images={images} />
    </Container>
  </section>;
}
