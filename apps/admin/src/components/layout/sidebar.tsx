"use client";

import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  ClipboardList,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Newspaper,
  ScrollText,
  Settings,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAdminCapabilities } from "@/features/auth/lib/admin-capabilities";

import styles from "./sidebar.module.css";

type NavigationItem = Readonly<{
  label: string;
  href: string;
  icon: LucideIcon;
}>;

const navigation: readonly NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Blogs", href: "/blogs", icon: Newspaper },
  { label: "Case Studies", href: "/case-studies", icon: FolderKanban },
  { label: "Careers", href: "/careers", icon: BriefcaseBusiness },
  { label: "Job Applications", href: "/job-applications", icon: ClipboardList },
  { label: "Our Team", href: "/team", icon: UsersRound },
  { label: "Contact Submissions", href: "/contact", icon: Inbox },
];

const auditLogsNavigation: NavigationItem = {
  label: "Audit Logs",
  href: "/audit-logs",
  icon: ScrollText,
};

const settingsNavigation: NavigationItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};

function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLink({ item, pathname }: Readonly<{ item: NavigationItem; pathname: string }>) {
  const Icon = item.icon;
  const isActive = isNavigationItemActive(pathname, item.href);

  return (
    <li>
      <Link
        aria-current={isActive ? "page" : undefined}
        className={`${styles.navigationItem} ${isActive ? styles.active : ""}`}
        href={item.href}
      >
        <Icon aria-hidden="true" className={styles.navigationIcon} size={18} strokeWidth={1.8} />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { canReadAuditLogs } = useAdminCapabilities();

  return (
    <aside className={styles.sidebar} data-testid="admin-sidebar">
      <Link className={styles.brand} href="/dashboard">
        <span className={styles.brandName}>VYNTICS</span>
        <span className={styles.brandContext}>Admin Panel</span>
      </Link>

      <nav aria-label="Admin navigation" className={styles.navigation}>
        <ul>
          {navigation.map((item) => (
            <NavigationLink item={item} key={item.href} pathname={pathname} />
          ))}
        </ul>
      </nav>

      <nav aria-label="Admin utilities" className={styles.utilities}>
        <ul>
          {canReadAuditLogs ? (
            <NavigationLink item={auditLogsNavigation} pathname={pathname} />
          ) : null}
          <NavigationLink item={settingsNavigation} pathname={pathname} />
        </ul>
      </nav>
    </aside>
  );
}
