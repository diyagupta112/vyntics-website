"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import {
  NOTICE_PERIOD_OPTIONS,
  applyProfessionalPayload,
  createProfessionalPayload,
  mapApplicationValidationErrors,
  readProfessionalFields,
  validateProfessionalFields,
  type ApplicationField,
  type FieldErrors,
} from "./application-contract";
import styles from "./application-form.module.css";

type Props = { slug: string; title: string };
type SubmitState = "idle" | "submitting" | "success" | "error";

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
let lastApplyTrigger: HTMLButtonElement | null = null;

export function ApplyButton({ children, className }: { children: ReactNode; className?: string }) {
  function open(event: MouseEvent<HTMLButtonElement>) {
    const dialog = document.querySelector<HTMLDialogElement>("#career-application-dialog");
    if (!dialog) return;
    lastApplyTrigger = event.currentTarget;
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    requestAnimationFrame(() => dialog.querySelector<HTMLInputElement>("input")?.focus());
  }

  return <button className={className} type="button" onClick={open}>{children}</button>;
}

function validate(form: HTMLFormElement): FieldErrors {
  const formData = new FormData(form);
  const errors: FieldErrors = {};
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const resume = formData.get("resume");
  Object.assign(errors, validateProfessionalFields(readProfessionalFields(formData)));

  if (!name) errors.name = "Enter your full name.";
  if (!email) errors.email = "Enter your email address.";
  else if (!form.elements.namedItem("email") || !(form.elements.namedItem("email") as HTMLInputElement).validity.valid) {
    errors.email = "Enter a valid email address.";
  }
  if (!phone) errors.phone = "Enter your phone number.";

  if (resume instanceof File && resume.size > 0) {
    const lowerName = resume.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
      errors.resume = "Choose a PDF, DOC, or DOCX file.";
    } else if (resume.size > MAX_RESUME_BYTES) {
      errors.resume = "Choose a resume smaller than 10 MiB.";
    }
  }

  return errors;
}

function failureMessage(status: number) {
  if (status === 404) return "This role is no longer available. Please return to Current Openings.";
  if (status === 422) return "Check the form details and resume, then try again.";
  if (status === 503) return "Resume storage is temporarily unavailable. Please try again later.";
  return "The application was not submitted. Please try again.";
}

export function ApplicationForm({ slug, title }: Props) {
  const [state, setState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function clearFieldError(field: ApplicationField) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    const form = event.currentTarget;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFeedback("");

    if (Object.keys(nextErrors).length > 0) {
      setState("error");
      setFeedback("Please correct the highlighted fields.");
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }

    const formData = new FormData(form);
    const resume = formData.get("resume");
    if (resume instanceof File && resume.size === 0) formData.delete("resume");
    if (!String(formData.get("cover_letter") ?? "").trim()) formData.delete("cover_letter");
    formData.set("name", String(formData.get("name") ?? "").trim());
    formData.set("email", String(formData.get("email") ?? "").trim());
    formData.set("phone", String(formData.get("phone") ?? "").trim());
    applyProfessionalPayload(formData, createProfessionalPayload(readProfessionalFields(formData)));

    setState("submitting");
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/careers/${encodeURIComponent(slug)}/apply`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 422) {
          const payload: unknown = await response.json().catch(() => null);
          const serverErrors = mapApplicationValidationErrors(payload);
          if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors }));
        }
        setState("error");
        setFeedback(failureMessage(response.status));
        requestAnimationFrame(() => resultRef.current?.focus());
        return;
      }

      form.reset();
      setCurrentlyWorking(false);
      setErrors({});
      setState("success");
      setFeedback("");
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setState("error");
      setFeedback("The application was not submitted. Please try again.");
      requestAnimationFrame(() => resultRef.current?.focus());
    }
  }

  if (state === "success") {
    return (
      <div className={styles.success} ref={resultRef} tabIndex={-1} role="status">
        <span aria-hidden="true">✓</span>
        <p className={styles.eyebrow}>Application received</p>
        <h2>Thank you for applying.</h2>
        <p>Our team will reach out to you soon if your profile meets our requirements. No further action is needed right now.</p>
        <Link href="/careers#current-openings">View current openings</Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={(event) => void submit(event)} noValidate>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Apply now</p>
        <h2>Apply for {title}</h2>
        <p>Share your details and experience with us. A resume remains optional.</p>
      </div>

      <fieldset className={styles.formSection}>
        <legend>Personal information</legend>
        <div className={styles.twoColumns}>
          <label>
            <span>Full name <em>Required</em></span>
            <input name="name" type="text" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "application-name-error" : undefined} onChange={() => clearFieldError("name")} />
            {errors.name ? <small id="application-name-error" className={styles.fieldError}>{errors.name}</small> : null}
          </label>
          <label>
            <span>Email <em>Required</em></span>
            <input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "application-email-error" : undefined} onChange={() => clearFieldError("email")} />
            {errors.email ? <small id="application-email-error" className={styles.fieldError}>{errors.email}</small> : null}
          </label>
        </div>
        <label>
          <span>Phone <em>Required</em></span>
          <input name="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "application-phone-error" : undefined} onChange={() => clearFieldError("phone")} />
          {errors.phone ? <small id="application-phone-error" className={styles.fieldError}>{errors.phone}</small> : null}
        </label>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend>Professional information</legend>
        <div className={styles.professionalGrid}>
          <fieldset className={styles.experienceGroup} aria-describedby={errors.experience ? "application-experience-error" : undefined}>
            <legend>Experience <em>Required</em></legend>
            <div className={styles.experienceInputs}>
              <label>
                <span>Years</span>
                <input name="experience_years" type="number" inputMode="numeric" min="0" step="1" defaultValue="0" aria-invalid={Boolean(errors.experience)} onChange={() => clearFieldError("experience")} />
              </label>
              <label>
                <span>Months</span>
                <input name="experience_months" type="number" inputMode="numeric" min="0" max="11" step="1" defaultValue="0" aria-invalid={Boolean(errors.experience)} onChange={() => clearFieldError("experience")} />
              </label>
            </div>
            {errors.experience ? <small id="application-experience-error" className={styles.fieldError}>{errors.experience}</small> : null}
          </fieldset>

          <label>
            <span>Notice period <em>Required</em></span>
            <select name="notice_period" defaultValue="" aria-invalid={Boolean(errors.notice_period)} aria-describedby={errors.notice_period ? "application-notice-period-error" : undefined} onChange={() => clearFieldError("notice_period")}>
              <option value="" disabled>Select your notice period</option>
              {NOTICE_PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {errors.notice_period ? <small id="application-notice-period-error" className={styles.fieldError}>{errors.notice_period}</small> : null}
          </label>
        </div>

        <div className={styles.workStatus}>
          <label className={styles.checkboxLabel}>
            <input
              name="currently_working"
              type="checkbox"
              value="true"
              checked={currentlyWorking}
              aria-invalid={Boolean(errors.currently_working)}
              aria-describedby={errors.currently_working ? "application-currently-working-error" : undefined}
              onChange={(event) => {
                setCurrentlyWorking(event.target.checked);
                clearFieldError("currently_working");
                clearFieldError("current_company");
              }}
            />
            <span><strong>Currently working?</strong><small>Yes, I am currently working</small></span>
          </label>
          {errors.currently_working ? <small id="application-currently-working-error" className={styles.fieldError}>{errors.currently_working}</small> : null}
        </div>

        <div className={styles.companySlot}>
          <label>
            <span>Current company <em>Optional</em></span>
            <input name="current_company" type="text" autoComplete="organization" maxLength={200} disabled={!currentlyWorking} aria-invalid={Boolean(errors.current_company)} aria-describedby={errors.current_company ? "application-current-company-error" : "application-current-company-hint"} onChange={() => clearFieldError("current_company")} />
            <small id="application-current-company-hint" className={styles.hint}>{currentlyWorking ? "You may leave this empty." : "Available when you are currently working."}</small>
            {errors.current_company ? <small id="application-current-company-error" className={styles.fieldError}>{errors.current_company}</small> : null}
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend>Application materials</legend>
        <label>
          <span>Resume <em>Optional</em></span>
          <input name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-invalid={Boolean(errors.resume)} aria-describedby={errors.resume ? "application-resume-error" : "application-resume-hint"} onChange={() => clearFieldError("resume")} />
          <small id="application-resume-hint" className={styles.hint}>PDF, DOC, or DOCX · maximum 10 MiB</small>
          {errors.resume ? <small id="application-resume-error" className={styles.fieldError}>{errors.resume}</small> : null}
        </label>
        <label>
          <span>Cover letter <em>Optional</em></span>
          <textarea name="cover_letter" rows={6} placeholder="Share any additional context you would like us to consider." />
        </label>
      </fieldset>

      <button type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Submit application"}
        {state !== "submitting" ? <span aria-hidden="true">→</span> : null}
      </button>

      <div
        className={`${styles.feedback} ${state === "error" ? styles.error : ""}`}
        ref={resultRef}
        role={state === "error" ? "alert" : "status"}
        tabIndex={-1}
      >
        {feedback}
      </div>
    </form>
  );
}

export function ApplicationDialog({ slug, title }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function close() {
    dialogRef.current?.close();
  }

  function handleClose() {
    document.documentElement.style.overflow = "";
    lastApplyTrigger?.focus();
    lastApplyTrigger = null;
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  return (
    <dialog
      aria-labelledby="application-dialog-title"
      className={styles.dialog}
      id="career-application-dialog"
      onClick={handleBackdropClick}
      onClose={handleClose}
      ref={dialogRef}
    >
      <div className={styles.dialogCard}>
        <div className={styles.dialogTopline}>
          <div>
            <p>Career application</p>
            <strong id="application-dialog-title">{title}</strong>
          </div>
          <button className={styles.closeButton} type="button" onClick={close} aria-label="Close application form">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <ApplicationForm slug={slug} title={title} />
      </div>
    </dialog>
  );
}
