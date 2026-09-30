"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./sidebar.module.css";

const navigation = [
  { label: "Dashboard", href: "/dashboard", available: true },
  { label: "Blogs", href: "/blogs", available: true },
  { label: "Case Studies", href: "/case-studies", available: true },
  { label: "Careers", href: "/careers", available: true },
  { label: "Job Applications", href: "/job-applications", available: true },
  { label: "Our Team", href: "/team", available: true },
  { label: "Contact Submissions", href: "/contact", available: true },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <Link className={styles.brand} href="/dashboard">
        <span className={styles.brandName}>VYNTICS</span>
        <span className={styles.brandContext}>Admin Panel</span>
      </Link>

      <nav aria-label="Admin navigation" className={styles.navigation}>
        <ul>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const className = [
              styles.navigationItem,
              isActive ? styles.active : "",
              !item.available ? styles.unavailable : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={item.href}>
                {item.available ? (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={className}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-disabled="true" className={className}>
                    {item.label}
                    <span className={styles.soon}>Later phase</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <p className={styles.phaseNote}>Authenticated workspace</p>
    </aside>
  );
}
