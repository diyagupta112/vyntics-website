"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";
import type { NavigationChild, NavigationItem } from "@/types/navigation";
import styles from "./site-header.module.css";

function matchesRoute(pathname: string, href: string) {
  if (!href.startsWith("/") || href.includes("#")) return false;
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function isCurrentItem(pathname: string, item: NavigationItem | NavigationChild): boolean {
  return matchesRoute(pathname, item.href) || Boolean(item.children?.some((child) => isCurrentItem(pathname, child)));
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12">
      <path d="m2.25 4.25 3.75 3.5 3.75-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className={`${styles.menuIcon} ${open ? styles.menuIconOpen : ""}`} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function ServiceSubmenu({ child, close }: { child: NavigationChild; close: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const id = `service-submenu-${child.label.toLowerCase().replace(/\s+/g, "-")}`;
  return <div className={styles.serviceGroup} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className={styles.serviceRow} data-current={isCurrentItem(pathname, child)}>
      {child.headingOnly ? (
        <div className={styles.serviceLabel}>
          <strong>{child.label}</strong><small>{child.description}</small>
        </div>
      ) : (
        <><Link className={styles.dropdownLink} href={child.href} onClick={close}><span>{child.label}</span><small>{child.description}</small></Link><button type="button" className={styles.submenuToggle} aria-label={`Show ${child.label} services`} aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}><ChevronIcon /></button></>
      )}
    </div>
    {open && <div id={id} className={styles.submenu}><p className={styles.submenuHeading}>{child.label} services</p>{child.children?.map((service) => <Link key={service.href} className={`${styles.dropdownLink} ${styles.innerServiceLink}`} aria-current={matchesRoute(pathname, service.href) ? "page" : undefined} href={service.href} onClick={close}><span>{service.label}</span><small>{service.description}</small><span className={styles.innerServiceArrow}><ChevronIcon /></span></Link>)}</div>}
  </div>;
}

function DesktopMenuItem({
  item,
  active,
  setActive,
}: {
  item: NavigationItem;
  active: string | null;
  setActive: (label: string | null) => void;
}) {
  const isOpen = active === item.label;
  const pathname = usePathname();

  return (
    <li className={styles.navItem} data-current={isCurrentItem(pathname, item)} onMouseEnter={() => setActive(item.label)} onFocus={() => setActive(item.label)}>
      {isOpen && (
        <motion.span
          className={styles.hoverPill}
          layoutId="navbar-hover-pill"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}

      {item.children ? (
        <button
          className={styles.navTrigger}
          type="button"
          aria-expanded={isOpen}
          onClick={() => setActive(isOpen ? null : item.label)}
        >
          <span>{item.label}</span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronIcon />
          </motion.span>
        </button>
      ) : (
        <Link className={styles.navLink} aria-current={matchesRoute(pathname, item.href) ? "page" : undefined} href={item.href}>{item.label}</Link>
      )}

      <AnimatePresence>
        {item.children && isOpen && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className={styles.dropdownArrow} />
            {item.children.map((child) => (
              child.children ? <ServiceSubmenu child={child} close={() => setActive(null)} key={child.href} /> : <Link className={styles.dropdownLink} aria-current={matchesRoute(pathname, child.href) ? "page" : undefined} href={child.href} key={child.href} onClick={() => setActive(null)}>
                <span>{child.label}</span>
                <small>{child.description}</small>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function SiteHeaderSpacer() {
  return <div className={styles.headerSpacer} aria-hidden="true" />;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let animationFrame: number | null = null;

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (mobileOpen || currentScrollY <= 16) {
        setHeaderVisible(true);
      } else if (scrollDelta >= 6) {
        setHeaderVisible(false);
        setActive(null);
      } else if (scrollDelta <= -4) {
        setHeaderVisible(true);
      }

      if (Math.abs(scrollDelta) >= 4 || currentScrollY <= 16) {
        lastScrollY.current = currentScrollY;
      }

      animationFrame = null;
    };

    const handleScroll = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateHeader);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, [mobileOpen]);

  return (
      <header
        className={`${styles.header} ${headerVisible ? styles.headerVisible : styles.headerHidden}`}
      >
        <div className={styles.inner}>
        <Link className={styles.logoLink} href="/" aria-label={`${siteConfig.name} home`} onClick={() => setMobileOpen(false)}>
          <span className={styles.logoImage} aria-hidden="true" />
          <span className={styles.wordmark}>VYNTICS</span>
        </Link>

        <div className={styles.rightRail}>
          <nav
            className={styles.desktopNav}
            aria-label="Primary navigation"
            onMouseLeave={() => setActive(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setActive(null);
            }}
          >
            <ul className={styles.navList}>
              {siteConfig.navigation.map((item) => (
                <DesktopMenuItem item={item} active={active} setActive={setActive} key={item.label} />
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <Link className={styles.demoButton} href="/#contact">
              Book a demo <span aria-hidden="true">&rarr;</span>
            </Link>
            <span className={styles.themeSlot}>
              <ThemeToggle />
            </span>
          </div>
        </div>

        <button
          className={styles.mobileToggle}
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            setHeaderVisible(true);
            setMobileOpen((open) => !open);
          }}
        >
          <MenuIcon open={mobileOpen} />
        </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              id="mobile-navigation"
              className={styles.mobileNav}
              aria-label="Mobile navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <Container className={styles.mobileNavInner}>
                {siteConfig.navigation.map((item) =>
                  item.children ? (
                    <details className={styles.mobileGroup} data-current={isCurrentItem(pathname, item)} key={item.label}>
                      <summary>{item.label}<ChevronIcon /></summary>
                      <div className={styles.mobileChildren}>
                        {item.children.map((child) => (
                          child.children ? <div className={styles.mobileServiceGroup} key={child.label}><Link className={styles.mobileServiceHeading} data-current={isCurrentItem(pathname, child)} href={child.href} onClick={() => setMobileOpen(false)}>{child.label}</Link><div className={styles.mobileChildren}>{child.children.map((service) => <Link key={service.href} aria-current={matchesRoute(pathname, service.href) ? "page" : undefined} href={service.href} onClick={() => setMobileOpen(false)}><span>{service.label}</span><span className={styles.mobileServiceArrow}><ChevronIcon /></span></Link>)}</div></div> : <Link aria-current={matchesRoute(pathname, child.href) ? "page" : undefined} href={child.href} key={child.href} onClick={() => setMobileOpen(false)}>{child.label}</Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link className={styles.mobileDirectLink} aria-current={matchesRoute(pathname, item.href) ? "page" : undefined} href={item.href} key={item.label} onClick={() => setMobileOpen(false)}>{item.label}</Link>
                  ),
                )}
                <Link className={styles.mobileDemoButton} href="/#contact" onClick={() => setMobileOpen(false)}>
                  Book a demo <span aria-hidden="true">&rarr;</span>
                </Link>
              </Container>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
  );
}
