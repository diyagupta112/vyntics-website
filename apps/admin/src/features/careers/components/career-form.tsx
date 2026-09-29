"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import { careersApi } from "../api/careers";
import {
  backendFieldErrors,
  careerToForm,
  emptyCareerForm,
  toCreateRequest,
  toUpdateRequest,
  validateCareerForm,
  type CareerFormErrors,
  type CareerFormValues,
} from "../lib/career-form";
import { careerErrorMessage } from "../lib/errors";
import type { Career } from "../types";
import styles from "./careers.module.css";

type Props = {
  career?: Career;
  onSaved?: (career: Career) => void;
};

type TextFieldProps = {
  field: keyof CareerFormValues;
  id: string;
  label: string;
  hint?: string;
  values: CareerFormValues;
  errors: CareerFormErrors;
  update: (field: keyof CareerFormValues, value: string) => void;
};

function TextField({
  field,
  id,
  label,
  hint,
  values,
  errors,
  update,
}: TextFieldProps) {
  return (
    <FormField
      error={errors[field]}
      hint={hint}
      htmlFor={id}
      label={label}
      required
    >
      <Input
        aria-invalid={Boolean(errors[field])}
        id={id}
        onChange={(event) => update(field, event.target.value)}
        value={values[field]}
      />
    </FormField>
  );
}

type JsonFieldProps = TextFieldProps & { rows?: "standard" | "large" };

function JsonField({
  field,
  id,
  label,
  hint,
  values,
  errors,
  update,
  rows = "standard",
}: JsonFieldProps) {
  return (
    <FormField
      error={errors[field]}
      hint={hint}
      htmlFor={id}
      label={`${label} (JSON)`}
      required
    >
      <Textarea
        aria-invalid={Boolean(errors[field])}
        className={
          rows === "large" ? styles.contentAreaLarge : styles.contentArea
        }
        id={id}
        onChange={(event) => update(field, event.target.value)}
        spellCheck={false}
        value={values[field]}
      />
    </FormField>
  );
}

export function CareerForm({ career, onSaved }: Props) {
  const router = useRouter();
  const isCreate = !career;
  const [values, setValues] = useState<CareerFormValues>(() =>
    career ? careerToForm(career) : emptyCareerForm,
  );
  const [errors, setErrors] = useState<CareerFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();

  function update(field: keyof CareerFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(undefined);
    setFailure(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const nextErrors = validateCareerForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    setFailure(undefined);
    setMessage(undefined);
    try {
      const saved = career
        ? await careersApi.update(career.id, toUpdateRequest(values))
        : await careersApi.create(toCreateRequest(values));

      if (isCreate) {
        router.push(`/careers/${encodeURIComponent(saved.slug)}/edit?created=1`);
      } else {
        setValues(careerToForm(saved));
        setMessage("Career changes saved.");
        onSaved?.(saved);
        if (saved.slug !== career.slug) {
          router.replace(`/careers/${encodeURIComponent(saved.slug)}/edit`);
        }
      }
    } catch (caught) {
      if (isApiError(caught) && caught.kind === "validation") {
        setErrors(backendFieldErrors(caught));
      }
      setFailure(
        careerErrorMessage(
          caught,
          isCreate ? "create this Career" : "save this Career",
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
      <section aria-labelledby="career-primary-heading" className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2 id="career-primary-heading">Role information</h2>
          <p>Identify the opportunity and the team it belongs to.</p>
        </div>
        <div className={styles.fields}>
          <div className={styles.full}>
            <TextField
              errors={errors}
              field="title"
              id="careerTitle"
              label="Title"
              update={update}
              values={values}
            />
          </div>
          <TextField
            errors={errors}
            field="slug"
            hint="Unique URL segment, for example: senior-product-designer"
            id="careerSlug"
            label="Slug"
            update={update}
            values={values}
          />
          <TextField
            errors={errors}
            field="department"
            id="careerDepartment"
            label="Department"
            update={update}
            values={values}
          />
          <TextField
            errors={errors}
            field="location"
            id="careerLocation"
            label="Location"
            update={update}
            values={values}
          />
          <TextField
            errors={errors}
            field="employmentType"
            id="careerEmploymentType"
            label="Employment type"
            update={update}
            values={values}
          />
          <div className={styles.full}>
            <TextField
              errors={errors}
              field="experience"
              id="careerExperience"
              label="Experience"
              update={update}
              values={values}
            />
          </div>
          <div className={styles.full}>
            <FormField
              error={errors.shortDescription}
              htmlFor="careerShortDescription"
              label="Short description"
              required
            >
              <Textarea
                aria-invalid={Boolean(errors.shortDescription)}
                className={styles.summaryArea}
                id="careerShortDescription"
                onChange={(event) =>
                  update("shortDescription", event.target.value)
                }
                value={values.shortDescription}
              />
            </FormField>
          </div>
        </div>
      </section>

      <section aria-labelledby="career-content-heading" className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2 id="career-content-heading">Role description</h2>
          <p>Use the structured JSON objects accepted by the Careers API.</p>
        </div>
        <JsonField
          errors={errors}
          field="description"
          hint="Full role description as a JSON object."
          id="careerDescription"
          label="Description"
          rows="large"
          update={update}
          values={values}
        />
      </section>

      <section aria-labelledby="career-expectations-heading" className={styles.section}>
        <div className={styles.sectionHeading}>
          <h2 id="career-expectations-heading">Responsibilities and requirements</h2>
          <p>Keep each long-form section readable and independently editable.</p>
        </div>
        <div className={styles.longFields}>
          <JsonField
            errors={errors}
            field="responsibilities"
            id="careerResponsibilities"
            label="Responsibilities"
            update={update}
            values={values}
          />
          <JsonField
            errors={errors}
            field="requirements"
            id="careerRequirements"
            label="Requirements"
            update={update}
            values={values}
          />
          <JsonField
            errors={errors}
            field="niceToHave"
            hint="Send an empty object when there is no additional content."
            id="careerNiceToHave"
            label="Nice to have"
            update={update}
            values={values}
          />
          <JsonField
            errors={errors}
            field="benefits"
            hint="Send an empty object when there is no additional content."
            id="careerBenefits"
            label="Benefits"
            update={update}
            values={values}
          />
        </div>
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
          {busy ? "Saving…" : isCreate ? "Create Career" : "Save Changes"}
        </Button>
        <Link className={styles.linkButton} href="/careers">
          Cancel
        </Link>
      </div>
    </form>
  );
}
