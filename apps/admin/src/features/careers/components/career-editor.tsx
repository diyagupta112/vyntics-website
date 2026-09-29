"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { careersApi } from "../api/careers";
import { careerErrorMessage } from "../lib/errors";
import type { Career } from "../types";
import { CareerForm } from "./career-form";
import styles from "./careers.module.css";

export function CareerEditor({ careerSlug }: { careerSlug: string }) {
  const [career, setCareer] = useState<Career>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setCareer(await careersApi.getBySlug(careerSlug));
    } catch (caught) {
      setError(careerErrorMessage(caught, "load this Career"));
    } finally {
      setLoading(false);
    }
  }, [careerSlug]);

  useEffect(() => {
    let active = true;
    careersApi
      .getBySlug(careerSlug)
      .then((item) => {
        if (active) setCareer(item);
      })
      .catch((caught: unknown) => {
        if (active) setError(careerErrorMessage(caught, "load this Career"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [careerSlug]);

  if (loading) {
    return (
      <div aria-label="Loading Career" className={styles.page} role="status">
        <div className={styles.skeleton} />
        <p>Loading Career…</p>
      </div>
    );
  }

  if (error || !career) {
    return (
      <section className={styles.errorState} role="alert">
        <h1>Career unavailable</h1>
        <p>{error ?? "This Career could not be loaded."}</p>
        <div className={styles.actions}>
          <Button onClick={() => void load()} variant="secondary">
            Try again
          </Button>
          <Link className={styles.linkButton} href="/careers">
            Back to Careers
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={career.title}
        description="Edit the role information. Existing Career records represent available roles."
        actions={
          <Link className={styles.linkButton} href="/careers">
            Back to Careers
          </Link>
        }
      />
      <div className={styles.immutableNote}>
        <strong>Added</strong>{" "}
        <time dateTime={career.published_at}>
          {new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
            new Date(career.published_at),
          )}
        </time>
        <span>Publication time is managed by the backend.</span>
      </div>
      <CareerForm career={career} onSaved={setCareer} />
    </div>
  );
}
