"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";
import type { NavigationChild, NavigationItem } from "@/types/navigation";
import styles from "./site-header.module.css";

const MENU_CLOSE_DELAY_MS = 180;
// Set to true to restore the navbar theme control.
const ENABLE_THEME_TOGGLE = false;

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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = `service-submenu-${child.label.toLowerCase().replace(/\s+/g, "-")}`;

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openSubmenu = () => {
    cancelClose();
    setOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, MENU_CLOSE_DELAY_MS);
  };

  useEffect(() => cancelClose, []);

  return <div className={styles.serviceGroup} onMouseEnter={openSubmenu} onMouseLeave={scheduleClose} onFocus={openSubmenu} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className={styles.serviceRow} data-current={isCurrentItem(pathname, child)}>
      {child.headingOnly ? (
        child.headingLink ? (
          <Link className={styles.serviceLabel} href={child.href} onClick={close}>
            <strong>{child.label}</strong><small>{child.description}</small>
          </Link>
        ) : (
          <button className={styles.serviceLabel} type="button" aria-expanded={open} aria-controls={id} onClick={openSubmenu}>
            <strong>{child.label}</strong><small>{child.description}</small>
          </button>
        )
      ) : (
        <><Link className={styles.dropdownLink} href={child.href} onClick={close}><span>{child.label}</span><small>{child.description}</small></Link><button type="button" className={styles.submenuToggle} aria-label={`Show ${child.label} services`} aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}><ChevronIcon /></button></>
      )}
    </div>
    {open && <div id={id} className={styles.submenu}><p className={styles.submenuHeading}>{child.label} services</p>{child.children?.map((service) => <Link key={service.href} className={`${styles.dropdownLink} ${styles.innerServiceLink}`} aria-current={matchesRoute(pathname, service.href) ? "page" : undefined} href={service.href} onClick={close}><span>{service.label}</span><small>{service.description}</small></Link>)}</div>}
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
          onClick={() => setActive(item.label)}
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

export function SiteHeader({ badges, mobileBadges }: { badges?: ReactNode; mobileBadges?: ReactNode } = {}) {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  // The home hero is dark, so the header is dark while it sits over the hero.
  const [overHero, setOverHero] = useState(pathname === "/");
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const menuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelMenuClose = () => {
    if (menuCloseTimer.current !== null) {
      clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }
  };

  const scheduleMenuClose = () => {
    cancelMenuClose();
    menuCloseTimer.current = setTimeout(() => {
      setActive(null);
      menuCloseTimer.current = null;
    }, MENU_CLOSE_DELAY_MS);
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      cancelMenuClose();
    };
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let animationFrame: number | null = null;
    let resizeFrame: number | null = null;
    const isHome = pathname === "/";
    let services: HTMLElement | null = null;
    let servicesObserver: IntersectionObserver | undefined;
    // True while the line at the header's bottom edge crosses the services section. It is kept up to
    // date by the observer, so the scroll frame below needs no layout reads.
    let inServices = false;

    const watchServices = () => {
      servicesObserver?.disconnect();
      servicesObserver = undefined;
      inServices = false;
      services = isHome ? document.querySelector<HTMLElement>("[data-home-page] [data-service-section]") : null;
      if (!services || typeof IntersectionObserver === "undefined") return;
      // Layout is read only here (setup, resize, or when the section element is replaced).
      const headerHeight = document.querySelector<HTMLElement>(`.${styles.header}`)?.offsetHeight ?? 80;
      const below = Math.max(0, window.innerHeight - headerHeight - 1);
      // A 1px-tall root band at the header's bottom edge: the section intersects it exactly while it crosses that line.
      servicesObserver = new IntersectionObserver((entries) => {
        const next = entries[entries.length - 1]?.isIntersecting ?? false;
        if (next === inServices) return;
        inServices = next;
        handleScroll();
      }, { rootMargin: `-${headerHeight}px 0px -${below}px 0px` });
      servicesObserver.observe(services);
    };

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - lastScrollY.current;
      const services = pathname === "/"
        ? document.querySelector<HTMLElement>("[data-home-page] [data-service-section]")
        : null;
      const servicesBounds = services?.getBoundingClientRect();
      const headerHeight = document.querySelector<HTMLElement>(`.${styles.header}`)?.offsetHeight ?? 80;
      const inServices = Boolean(servicesBounds && servicesBounds.top <= headerHeight && servicesBounds.bottom > headerHeight);
      const heroBounds = pathname === "/"
        ? document.querySelector<HTMLElement>("[data-home-hero]")?.getBoundingClientRect()
        : null;
      setOverHero(Boolean(heroBounds && heroBounds.bottom > headerHeight));
      setAtTop(currentScrollY <= 16);

      if (mobileOpen || inServices || currentScrollY <= 16) {
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

    const handleResize = () => {
      if (resizeFrame !== null) return;
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        watchServices();
        handleScroll();
      });
    };

    watchServices();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    updateHeader();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      servicesObserver?.disconnect();
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    };
  }, [mobileOpen, pathname]);

  return (
      <header
        className={`${styles.header} ${headerVisible ? styles.headerVisible : styles.headerHidden}${overHero ? ` ${styles.headerDark}` : ""}${overHero && atTop && !mobileOpen ? ` ${styles.headerClear}` : ""}`}
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
            onMouseEnter={cancelMenuClose}
            onMouseLeave={scheduleMenuClose}
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

          {badges}

          <div className={styles.actions}>
            <Link className={`${styles.demoButton} siteCta`} href="/contact-us">
              Book a demo <span aria-hidden="true">&rarr;</span>
            </Link>
            {ENABLE_THEME_TOGGLE && (
              <span className={styles.themeSlot}>
                <ThemeToggle />
              </span>
            )}
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
                          child.children ? <div className={styles.mobileServiceGroup} key={child.label}>{child.headingLink ? <Link className={styles.mobileServiceHeading} aria-current={matchesRoute(pathname, child.href) ? "page" : undefined} href={child.href} onClick={() => setMobileOpen(false)}>{child.label}</Link> : <div className={styles.mobileServiceHeading} data-current={isCurrentItem(pathname, child)}>{child.label}</div>}<div className={styles.mobileChildren}>{child.children.map((service) => <Link key={service.href} aria-current={matchesRoute(pathname, service.href) ? "page" : undefined} href={service.href} onClick={() => setMobileOpen(false)}><span>{service.label}</span></Link>)}</div></div> : <Link aria-current={matchesRoute(pathname, child.href) ? "page" : undefined} href={child.href} key={child.href} onClick={() => setMobileOpen(false)}>{child.label}</Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link className={styles.mobileDirectLink} aria-current={matchesRoute(pathname, item.href) ? "page" : undefined} href={item.href} key={item.label} onClick={() => setMobileOpen(false)}>{item.label}</Link>
                  ),
                )}
                <Link className={`${styles.mobileDemoButton} siteCta`} href="/contact-us" onClick={() => setMobileOpen(false)}>
                  Book a demo <span aria-hidden="true">&rarr;</span>
                </Link>
                {mobileBadges}
              </Container>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
  );
}
