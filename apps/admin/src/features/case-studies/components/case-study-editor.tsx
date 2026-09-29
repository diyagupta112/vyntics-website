"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { caseStudiesApi } from "../api/case-studies";
import { caseStudyErrorMessage } from "../lib/errors";
import type { CaseStudy } from "../types";
import { CaseStudyForm } from "./case-study-form";
import { CoverImageControl } from "./cover-image-control";
import styles from "./case-studies.module.css";

export function CaseStudyEditor({ caseStudyId }: { caseStudyId: string }) {
  const [caseStudy, setCaseStudy] = useState<CaseStudy>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setCaseStudy(await caseStudiesApi.get(caseStudyId));
    } catch (caught) {
      setError(caseStudyErrorMessage(caught, "load this Case Study"));
    } finally {
      setLoading(false);
    }
  }, [caseStudyId]);

  useEffect(() => {
    let active = true;
    caseStudiesApi
      .get(caseStudyId)
      .then((item) => {
        if (active) setCaseStudy(item);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caseStudyErrorMessage(caught, "load this Case Study"));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [caseStudyId]);

  if (loading) {
    return (
      <div
        aria-label="Loading Case Study"
        className={styles.page}
        role="status"
      >
        <div className={styles.skeleton} />
        <p>Loading Case Study…</p>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <section className={styles.errorState} role="alert">
        <h1>Case Study unavailable</h1>
        <p>{error ?? "This Case Study could not be loaded."}</p>
        <div className={styles.actions}>
          <Button onClick={() => void load()} variant="secondary">
            Try again
          </Button>
          <Link className={styles.linkButton} href="/case-studies">
            Back to Case Studies
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.page}>
      <CoverImageControl caseStudy={caseStudy} onChanged={setCaseStudy} />
      <PageHeader
        title={caseStudy.title}
        description="Edit the Case Study's information, metadata, content, and publication status."
        actions={
          <Link className={styles.linkButton} href="/case-studies">
            Back to Case Studies
          </Link>
        }
      />
      <CaseStudyForm caseStudy={caseStudy} onSaved={setCaseStudy} />
    </div>
  );
}
