import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
