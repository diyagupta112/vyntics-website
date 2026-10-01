"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { caseStudiesApi } from "../api/case-studies";
import { caseStudyErrorMessage } from "../lib/errors";
import type { CaseStudy } from "../types";
import { CaseStudyForm } from "./case-study-form";
import { ConfirmDelete } from "./confirm-delete";
import { CoverImageControl } from "./cover-image-control";
import styles from "./case-studies.module.css";

export function CaseStudyEditor({ caseStudyId }: { caseStudyId: string }) {
  const router = useRouter();
  const [caseStudy, setCaseStudy] = useState<CaseStudy>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false); const [deleteBusy, setDeleteBusy] = useState(false); const [deleteError, setDeleteError] = useState<string>();
  async function remove() { if (!caseStudy || deleteBusy) return; setDeleteBusy(true); setDeleteError(undefined); try { await caseStudiesApi.delete(caseStudy.id); router.push("/case-studies?deleted=1"); } catch (caught) { setDeleteError(caseStudyErrorMessage(caught, "delete this Case Study")); } finally { setDeleteBusy(false); } }

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
      <PageHeader
        title={caseStudy.title}
        description="Edit the Case Study's information, metadata, content, and publication status."
        actions={<><Link className={styles.linkButton} href="/case-studies">
            Back to Case Studies
          </Link><Button onClick={() => setConfirming(true)} variant="destructive">Delete Case Study</Button></>}
      />
      <div className={styles.detailLayout}>
        <CaseStudyForm caseStudy={caseStudy} onSaved={setCaseStudy} />
        <aside className={styles.imagePanel}><CoverImageControl caseStudy={caseStudy} onChanged={setCaseStudy} /></aside>
      </div>
      {confirming ? <ConfirmDelete busy={deleteBusy} error={deleteError} onCancel={() => setConfirming(false)} onConfirm={() => void remove()} title={caseStudy.title} /> : null}
    </div>
  );
}
