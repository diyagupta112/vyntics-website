"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { careersApi } from "../api/careers";
import { careerErrorMessage } from "../lib/errors";
import type { CareerListItem } from "../types";
import { ConfirmDelete } from "./confirm-delete";
import styles from "./careers.module.css";

function editPath(career: CareerListItem) {
  return `/careers/${encodeURIComponent(career.slug)}/edit`;
}

function applicantPath(career: CareerListItem) {
  return `/job-applications?careerId=${encodeURIComponent(career.id)}`;
}

export function CareerList() {
  const [careers, setCareers] = useState<CareerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [deleting, setDeleting] = useState<CareerListItem>();
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setCareers(await careersApi.list());
    } catch (caught) {
      setError(careerErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    careersApi
      .list()
      .then((items) => {
        if (active) setCareers(items);
      })
      .catch((caught: unknown) => {
        if (active) setError(careerErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(undefined);
    try {
      await careersApi.delete(deleting.id);
      setCareers((items) => items.filter((item) => item.id !== deleting.id));
      setDeleting(undefined);
    } catch (caught) {
      setDeleteError(careerErrorMessage(caught, "delete this Career"));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Careers"
        description="Manage the roles currently available on the Vyntics website."
        actions={
          <Link className={styles.linkButton} href="/careers/new">
            Create Career
          </Link>
        }
      />

      {loading ? (
        <div aria-label="Loading Careers" role="status">
          <div className={styles.skeletonGrid}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
          <span className={styles.muted}>Loading Careers…</span>
        </div>
      ) : null}

      {!loading && error ? (
        <section className={styles.errorState} role="alert">
          <h2>Careers could not be loaded</h2>
          <p>{error}</p>
          <Button onClick={() => void load()} variant="secondary">
            Try again
          </Button>
        </section>
      ) : null}

      {!loading && !error && careers.length === 0 ? (
        <section className={styles.empty}>
          <h2>No Careers available</h2>
          <p>Create a Career to make a new role available.</p>
          <Link className={styles.linkButton} href="/careers/new">
            Create your first Career
          </Link>
        </section>
      ) : null}

      {!loading && !error && careers.length > 0 ? (
        <div className={styles.careerGrid}>
          {careers.map((career) => (
            <article className={styles.careerCard} key={career.id}>
              <div className={styles.cardHeading}>
                <div>
                  <p className={styles.eyebrow}>{career.department}</p>
                  <h2>
                    <Link
                      aria-label={`Open ${career.title} for editing`}
                      className={styles.titleLink}
                      href={editPath(career)}
                    >
                      {career.title}
                    </Link>
                  </h2>
                </div>
                <span className={styles.roleMarker}>Available role</span>
              </div>

              <dl className={styles.cardFacts}>
                <div>
                  <dt>Location</dt>
                  <dd>{career.location}</dd>
                </div>
                <div>
                  <dt>Employment</dt>
                  <dd>{career.employment_type}</dd>
                </div>
                <div>
                  <dt>Experience</dt>
                  <dd>{career.experience}</dd>
                </div>
              </dl>

              <p className={styles.description}>{career.short_description}</p>
              <p className={styles.metadata}>
                Added{" "}
                <time dateTime={career.published_at}>
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                  }).format(new Date(career.published_at))}
                </time>
              </p>

              <div className={styles.actions}>
                <Link className={styles.linkButton} href={editPath(career)}>
                  Edit Career
                </Link>
                <Link
                  className={styles.linkButton}
                  href={applicantPath(career)}
                >
                  See Applicants for This Role
                </Link>
                <Button
                  aria-label={`Delete ${career.title}`}
                  onClick={() => {
                    setDeleteError(undefined);
                    setDeleting(career);
                  }}
                  variant="ghost"
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
