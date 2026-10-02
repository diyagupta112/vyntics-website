"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { blogsApi } from "@/features/blogs/api/blogs";
import { careersApi } from "@/features/careers/api/careers";
import { caseStudiesApi } from "@/features/case-studies/api/case-studies";
import { contactSubmissionsApi } from "@/features/contact-submissions/api/contact-submissions";
import { jobApplicationsApi } from "@/features/job-applications/api/job-applications";
import { teamMembersApi } from "@/features/team-members/api/team-members";
import styles from "./page.module.css";

type Metric = { label: string; value: number; href: string; attention?: boolean };

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [contacts, applications, blogs, studies, careers, members] = await Promise.all([
        contactSubmissionsApi.list(),
        jobApplicationsApi.listAll(),
        blogsApi.list(),
        caseStudiesApi.list(),
        careersApi.list(),
        teamMembersApi.list(),
      ]);
      setMetrics([
        { label: "New Contact Submissions", value: contacts.filter((item) => item.status === "new").length, href: "/contact", attention: true },
        { label: "New Job Applications", value: applications.filter((item) => item.status === "new").length, href: "/job-applications", attention: true },
        { label: "Draft Blogs", value: blogs.filter((item) => item.status === "draft").length, href: "/blogs", attention: true },
        { label: "Draft Case Studies", value: studies.filter((item) => item.status === "draft").length, href: "/case-studies", attention: true },
        { label: "Published Blogs", value: blogs.filter((item) => item.status === "published").length, href: "/blogs" },
        { label: "Published Case Studies", value: studies.filter((item) => item.status === "published").length, href: "/case-studies" },
        { label: "Available Careers", value: careers.length, href: "/careers" },
        { label: "Team Members", value: members.length, href: "/team" },
      ]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- load synchronizes six existing Admin APIs.
  useEffect(() => { void load(); }, [load]);

  if (loading) return <div aria-label="Loading dashboard" className={styles.loadingGrid} role="status">{Array.from({ length: 8 }, (_, index) => <div className={styles.skeleton} key={index} />)}</div>;
  if (error) return <section className={styles.errorState} role="alert"><h2>Dashboard could not be loaded</h2><p>Live operational data is temporarily unavailable.</p><Button onClick={() => void load()} variant="secondary">Try again</Button></section>;

  const attention = metrics.filter((metric) => metric.attention && metric.value > 0);
  return <>
    <section aria-labelledby="overview-heading" className={styles.section}>
      <div className={styles.sectionHeading}><h1 id="overview-heading">Operational overview</h1><p>Monitor content, hiring, people, and incoming requests.</p></div>
      <div className={styles.cardGrid} data-testid="dashboard-overview-grid">
        {metrics.map((metric) => <Link className={styles.metricCard} href={metric.href} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>View records <span aria-hidden="true">→</span></small></Link>)}
      </div>
    </section>
    <section aria-labelledby="attention-heading" className={styles.section}>
      <div className={styles.sectionHeading}><h2 id="attention-heading">Needs attention</h2><p>Items that may need an admin review.</p></div>
      {attention.length ? <div className={styles.attentionList}>{attention.map((item) => <Link href={item.href} key={item.label}><span>{item.label}</span><strong>{item.value}</strong></Link>)}</div> : <div className={styles.emptyState}><h3>Nothing needs attention</h3><p>There are no new submissions, applications, or draft content.</p></div>}
    </section>
  </>;
}
