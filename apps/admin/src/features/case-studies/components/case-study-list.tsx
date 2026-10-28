"use client";

import { PreviewAction } from "@/components/preview/preview-action";
import { caseStudySnapshot } from "@/components/preview/snapshot";
import { caseStudyToForm } from "../lib/case-study-form";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ServiceFilter } from "@/components/forms/service-filter";
import { serviceFilterParents, subServiceFilterChoices } from "@/lib/content/service-filter";
import { Button } from "@/components/ui/button";
import { caseStudiesApi } from "../api/case-studies";
import { caseStudyErrorMessage } from "../lib/errors";
import type { CaseStudy } from "../types";
import { ConfirmDelete } from "./confirm-delete";
import { StatusBadge } from "./status-badge";
import styles from "./case-studies.module.css";

export function CaseStudyList() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [service, setService] = useState("");
  const [subService, setSubService] = useState("");
  const [reload, setReload] = useState(0);
  const [deleting, setDeleting] = useState<CaseStudy>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const load = useCallback(() => {
    setLoading(true);
    setError(undefined);
    setReload((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    caseStudiesApi
      .list({ service, subService })
      .then((items) => {
        if (active) setCaseStudies(items);
      })
      .catch((caught: unknown) => {
        if (active) setError(caseStudyErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [service, subService, reload]);

  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(undefined);
    try {
      await caseStudiesApi.delete(deleting.id);
      setCaseStudies((items) =>
        items.filter((item) => item.id !== deleting.id),
      );
      setDeleting(undefined);
    } catch (caught) {
      setDeleteError(caseStudyErrorMessage(caught, "delete this Case Study"));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Case Studies"
        description="Manage client work, publication status, and cover images."
        actions={
          <Link className={styles.linkButton} href="/case-studies/new">
            Create Case Study
          </Link>
        }
      />

      <ServiceFilter idPrefix="case-study" parentLabel="Service" childLabel="Sub-service" allParents="All Services" allChildren="All Sub-services" parents={serviceFilterParents} childOptions={subServiceFilterChoices} parent={service} child={subService} onChange={(nextService, nextSub) => {
        if (nextService === service && nextSub === subService) return;
        setLoading(true); setError(undefined); setService(nextService); setSubService(nextSub);
      }} />

      {loading ? (
        <div aria-label="Loading Case Studies" role="status">
          <div className={styles.skeleton} />
          <span className={styles.muted}>Loading Case Studies…</span>
        </div>
      ) : null}

      {!loading && error ? (
        <section className={styles.errorState} role="alert">
          <h2>Case Studies could not be loaded</h2>
          <p>{error}</p>
          <Button onClick={() => void load()} variant="secondary">
            Try again
          </Button>
        </section>
      ) : null}

      {!loading && !error && caseStudies.length === 0 ? (
        <section className={styles.empty}>
          <h2>{service ? "No Case Studies match this filter" : "No Case Studies yet"}</h2>
          <p>{service ? "Try a different service or sub-service." : "Create a draft to begin documenting client work."}</p>
          <Link className={styles.linkButton} href="/case-studies/new">
            Create your first Case Study
          </Link>
        </section>
      ) : null}

      {!loading && !error && caseStudies.length > 0 ? (
        <div className={styles.studyList}>
          {caseStudies.map((caseStudy) => (
            <article className={styles.studyCard} key={caseStudy.id}>
              <Link
                aria-label={`Edit ${caseStudy.title}`}
                className={styles.cardLink}
                href={`/case-studies/${caseStudy.id}/edit`}
              >
                {caseStudy.cover_image_url ? (
                  <Image
                    alt={`Cover for ${caseStudy.title}`}
                    className={styles.studyImage}
                    height={360}
                    src={caseStudy.cover_image_url}
                    unoptimized
                    width={640}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>No cover image</div>
                )}
                <div className={styles.studyCopy}>
                  <div className={styles.studyHeading}>
                    <span className={styles.clientName}>{caseStudy.client_name}</span>
                    <span className={styles.cardIndicators}>{caseStudy.featured ? <span className={styles.badge}>Featured</span> : null}<StatusBadge status={caseStudy.status} /></span>
                  </div>
                  <h2>{caseStudy.title}</h2>
                </div>
              </Link>
              <div className={styles.cardActions}>
        <PreviewAction saved label={`Preview ${caseStudy.title}`} className={styles.previewButton} build={() => caseStudySnapshot(caseStudyToForm(caseStudy), caseStudy)} />
                <Button
                  className={styles.deleteButton}
                  aria-label={`Delete ${caseStudy.title}`}
                  onClick={() => {
                    setDeleteError(undefined);
                    setDeleting(caseStudy);
                  }}
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {deleting ? (
        <ConfirmDelete
          busy={deleteBusy}
          error={deleteError}
          onCancel={() => setDeleting(undefined)}
          onConfirm={() => void confirmDelete()}
          title={deleting.title}
        />
      ) : null}
    </div>
  );
}
