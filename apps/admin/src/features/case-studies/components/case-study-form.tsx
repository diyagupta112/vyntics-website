"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import { caseStudiesApi } from "../api/case-studies";
import {
  backendFieldErrors,
  caseStudyToForm,
  emptyCaseStudyForm,
  parseList,
  toCreateRequest,
  toUpdateRequest,
  validateCaseStudyForm,
  type CaseStudyFormErrors,
  type CaseStudyFormValues,
} from "../lib/case-study-form";
import { caseStudyErrorMessage } from "../lib/errors";
import type { CaseStudy } from "../types";
import styles from "./case-studies.module.css";

type Props = {
  caseStudy?: CaseStudy;
  onSaved?: (caseStudy: CaseStudy) => void;
};

export function CaseStudyForm({ caseStudy, onSaved }: Props) {
  const router = useRouter();
  const isCreate = !caseStudy;
  const [values, setValues] = useState<CaseStudyFormValues>(() =>
    caseStudy ? caseStudyToForm(caseStudy) : emptyCaseStudyForm,
  );
  const [errors, setErrors] = useState<CaseStudyFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();

  function update(field: keyof CaseStudyFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(undefined);
    setFailure(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const nextErrors = validateCaseStudyForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    setFailure(undefined);
    setMessage(undefined);
    try {
      const saved = caseStudy
        ? await caseStudiesApi.update(caseStudy.id, toUpdateRequest(values))
        : await caseStudiesApi.create(toCreateRequest(values));

      if (isCreate) {
        router.push(`/case-studies/${saved.id}/edit?created=1`);
      } else {
        setValues(caseStudyToForm(saved));
        setMessage("Case Study changes saved.");
        onSaved?.(saved);
      }
    } catch (caught) {
      if (isApiError(caught) && caught.kind === "validation") {
        setErrors(backendFieldErrors(caught));
      }
      setFailure(
        caseStudyErrorMessage(
          caught,
          isCreate ? "create this Case Study" : "save this Case Study",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      <section
        aria-labelledby="case-study-primary-heading"
        className={styles.section}
      >
        <div className={styles.sectionHeading}>
          <h2 id="case-study-primary-heading">Primary information</h2>
          <p>Identify the work and control its publication state.</p>
        </div>
        <div className={styles.fields}>
          <div className={styles.full}>
            <FormField
              error={errors.title}
              htmlFor="caseStudyTitle"
              label="Title"
              required
            >
              <Input
                aria-invalid={Boolean(errors.title)}
                id="caseStudyTitle"
                onChange={(event) => update("title", event.target.value)}
                value={values.title}
              />
            </FormField>
          </div>
          <FormField
            error={errors.slug}
            hint="Unique URL segment, for example: retail-platform-redesign"
            htmlFor="caseStudySlug"
            label="Slug"
            required
          >
            <Input
              aria-invalid={Boolean(errors.slug)}
              id="caseStudySlug"
              onChange={(event) => update("slug", event.target.value)}
              value={values.slug}
            />
          </FormField>
          <FormField
            error={errors.clientName}
            htmlFor="caseStudyClientName"
            label="Client name"
            required
          >
            <Input
              aria-invalid={Boolean(errors.clientName)}
              id="caseStudyClientName"
              onChange={(event) => update("clientName", event.target.value)}
              value={values.clientName}
            />
          </FormField>
          <FormField
            error={errors.status}
            hint={
              isCreate
                ? "Upload a cover after creation before publishing."
                : "FastAPI validates publishing requirements."
            }
            htmlFor="caseStudyStatus"
            label="Status"
            required
          >
            <Select
              id="caseStudyStatus"
              onChange={(event) => update("status", event.target.value)}
              value={values.status}
            >
              <option value="draft">Draft</option>
              {!isCreate ? <option value="published">Published</option> : null}
              <option value="unpublished">Unpublished</option>
            </Select>
          </FormField>
          <div className={styles.full}>
            <FormField
              error={errors.excerpt}
              htmlFor="caseStudyExcerpt"
              label="Excerpt"
              required
            >
              <Textarea
                aria-invalid={Boolean(errors.excerpt)}
                className={styles.excerptArea}
                id="caseStudyExcerpt"
                onChange={(event) => update("excerpt", event.target.value)}
                value={values.excerpt}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="case-study-seo-heading"
        className={styles.section}
      >
        <div className={styles.sectionHeading}>
          <h2 id="case-study-seo-heading">Search information</h2>
          <p>Metadata required by the current Case Study API contract.</p>
        </div>
        <div className={styles.fields}>
          <div className={styles.full}>
            <FormField
              error={errors.seoTitle}
              htmlFor="caseStudySeoTitle"
              label="SEO title"
              required
            >
              <Input
                aria-invalid={Boolean(errors.seoTitle)}
                id="caseStudySeoTitle"
                onChange={(event) => update("seoTitle", event.target.value)}
                value={values.seoTitle}
              />
            </FormField>
          </div>
          <div className={styles.full}>
            <FormField
              error={errors.metaDescription}
              htmlFor="caseStudyMetaDescription"
              label="Meta description"
              required
            >
              <Textarea
                aria-invalid={Boolean(errors.metaDescription)}
                id="caseStudyMetaDescription"
                onChange={(event) =>
                  update("metaDescription", event.target.value)
                }
                value={values.metaDescription}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="case-study-metadata-heading"
        className={styles.section}
      >
        <div className={styles.sectionHeading}>
          <h2 id="case-study-metadata-heading">Supporting metadata</h2>
          <p>Separate multiple values with commas.</p>
        </div>
        <div className={styles.fields}>
          <FormField
            error={errors.techStack}
            hint="Example: Python, FastAPI, PostgreSQL"
            htmlFor="caseStudyTechStack"
            label="Tech stack"
          >
            <Input
              aria-invalid={Boolean(errors.techStack)}
              id="caseStudyTechStack"
              onChange={(event) => update("techStack", event.target.value)}
              value={values.techStack}
            />
            {parseList(values.techStack).length ? (
              <div aria-label="Tech stack values" className={styles.chipList}>
                {parseList(values.techStack).map((item) => (
                  <span className={styles.chip} key={item}>{item}</span>
                ))}
              </div>
            ) : null}
          </FormField>
          <FormField
            error={errors.tags}
            hint="Example: AI, Web Development"
            htmlFor="caseStudyTags"
            label="Tags"
          >
            <Input
              aria-invalid={Boolean(errors.tags)}
              id="caseStudyTags"
              onChange={(event) => update("tags", event.target.value)}
              value={values.tags}
            />
            {parseList(values.tags).length ? (
              <div aria-label="Tag values" className={styles.chipList}>
                {parseList(values.tags).map((item) => (
                  <span className={styles.chip} key={item}>{item}</span>
                ))}
              </div>
            ) : null}
          </FormField>
        </div>
      </section>

      <section
        aria-labelledby="case-study-content-heading"
        className={styles.section}
      >
        <div className={styles.sectionHeading}>
          <h2 id="case-study-content-heading">Main content</h2>
          <p>Use the structured JSON object accepted by the Case Study API.</p>
        </div>
        <FormField
          error={errors.content}
          htmlFor="caseStudyContent"
          label="Structured content (JSON)"
          required
        >
          <Textarea
            aria-invalid={Boolean(errors.content)}
            className={styles.contentArea}
            id="caseStudyContent"
            onChange={(event) => update("content", event.target.value)}
            spellCheck={false}
            value={values.content}
          />
        </FormField>
      </section>

      {failure ? (
        <div className={styles.feedback} role="alert">
          <strong>Changes were not saved</strong>
          <p>{failure}</p>
        </div>
      ) : null}
      {message ? (
        <div className={styles.feedback} role="status">
          <strong>Saved</strong>
          <p>{message}</p>
        </div>
      ) : null}

      <div className={styles.formActions}>
        <Button disabled={busy} type="submit">
          {busy
            ? "Saving…"
            : isCreate
              ? "Create Case Study"
              : "Save Changes"}
        </Button>
        <Link className={styles.linkButton} href="/case-studies">
          Cancel
        </Link>
      </div>
    </form>
  );
}
