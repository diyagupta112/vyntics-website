"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { CreateFlowActions } from "@/components/create-flow/two-step-create-flow";
import { FeaturedControl } from "@/components/forms/featured-control";
import { FormField } from "@/components/forms/form-field";
import { RichTextEditor } from "@/components/forms/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import { blogsApi } from "../api/blogs";
import { blogErrorMessage } from "../lib/errors";
import { backendFieldErrors, blogToForm, emptyBlogForm, toCreateRequest, toUpdateRequest, validateBlogForm, type BlogFormErrors, type BlogFormValues } from "../lib/blog-form";
import type { Blog, BlogStatus } from "../types";
import styles from "./blogs.module.css";

type Props = { blog?: Blog; createFlow?: boolean; onCreated?: (blog: Blog) => void; onSaved?: (blog: Blog) => void };

export function BlogForm({ blog, createFlow = false, onCreated, onSaved }: Props) {
  const router = useRouter();
  const isCreate = !blog;
  const [values, setValues] = useState<BlogFormValues>(() => blog ? blogToForm(blog) : emptyBlogForm);
  const [errors, setErrors] = useState<BlogFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();

  function update<K extends keyof BlogFormValues>(field: K, value: BlogFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(undefined); setFailure(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const nextErrors = validateBlogForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true); setFailure(undefined); setMessage(undefined);
    try {
      const saved = blog
        ? await blogsApi.update(blog.id, toUpdateRequest(values))
        : await blogsApi.create(toCreateRequest(values));
      if (isCreate) {
        if (onCreated) onCreated(saved);
        else router.push(`/blogs/${saved.id}/edit?created=1`);
      }
      else {
        setValues(blogToForm(saved));
        setMessage("Blog changes saved.");
        onSaved?.(saved);
      }
    } catch (caught) {
      if (isApiError(caught) && caught.kind === "validation") setErrors(backendFieldErrors(caught));
      setFailure(blogErrorMessage(caught, isCreate ? "create this Blog" : "save this Blog"));
    } finally { setBusy(false); }
  }

  return <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
    <section className={styles.section} aria-labelledby="blog-content-heading">
      <div className={styles.sectionHeading}><h2 id="blog-content-heading">Blog content</h2><p>Required editorial and publication fields.</p></div>
      <div className={styles.fields}>
        <FormField htmlFor="title" label="Title" required error={errors.title}><Input id="title" value={values.title} aria-invalid={Boolean(errors.title)} onChange={(e) => update("title", e.target.value)} /></FormField>
        <FormField htmlFor="slug" label="Slug" required error={errors.slug} hint="Unique URL segment, for example: building-with-ai"><Input id="slug" value={values.slug} aria-invalid={Boolean(errors.slug)} onChange={(e) => update("slug", e.target.value)} /></FormField>
        <FormField htmlFor="author" label="Author" required error={errors.author}><Input id="author" value={values.author} aria-invalid={Boolean(errors.author)} onChange={(e) => update("author", e.target.value)} /></FormField>
        <FormField htmlFor="category" label="Category" required error={errors.category}><Input id="category" value={values.category} aria-invalid={Boolean(errors.category)} onChange={(e) => update("category", e.target.value)} /></FormField>
        <FormField htmlFor="readTime" label="Read time (minutes)" required error={errors.readTime}><Input id="readTime" inputMode="numeric" type="number" step="1" value={values.readTime} aria-invalid={Boolean(errors.readTime)} onChange={(e) => update("readTime", e.target.value)} /></FormField>
        <FormField htmlFor="status" label="Status" required error={errors.status} hint={isCreate || createFlow ? "Add a cover in Step 2 before publishing." : "FastAPI validates publishing requirements."}><Select id="status" value={values.status} onChange={(e) => update("status", e.target.value as BlogStatus)}><option value="draft">Draft</option>{!isCreate && !createFlow ? <option value="published">Published</option> : null}<option value="unpublished">Unpublished</option></Select></FormField>
        <FeaturedControl id="blog-featured" checked={values.isFeatured} onChange={(checked) => update("isFeatured", checked)} resourceName="blog" error={errors.isFeatured} />
        <div className={styles.full}><FormField htmlFor="excerpt" label="Excerpt" required error={errors.excerpt}><Textarea id="excerpt" value={values.excerpt} aria-invalid={Boolean(errors.excerpt)} onChange={(e) => update("excerpt", e.target.value)} /></FormField></div>
        <div className={styles.full}><FormField htmlFor="content" label="Content" required error={errors.content} hint="Use the toolbar to structure and format the article."><RichTextEditor id="content" invalid={Boolean(errors.content)} value={values.content} onChange={(value) => update("content", value)} /></FormField></div>
      </div>
    </section>
    <section className={styles.section} aria-labelledby="blog-seo-heading">
      <div className={styles.sectionHeading}><h2 id="blog-seo-heading">Search metadata</h2><p>Metadata required by the current Blog API contract.</p></div>
      <div className={styles.fields}>
        <FormField htmlFor="seoTitle" label="SEO title" required error={errors.seoTitle}><Input id="seoTitle" value={values.seoTitle} aria-invalid={Boolean(errors.seoTitle)} onChange={(e) => update("seoTitle", e.target.value)} /></FormField>
        <div className={styles.full}><FormField htmlFor="metaDescription" label="Meta description" required error={errors.metaDescription}><Textarea id="metaDescription" value={values.metaDescription} aria-invalid={Boolean(errors.metaDescription)} onChange={(e) => update("metaDescription", e.target.value)} /></FormField></div>
      </div>
    </section>
    {failure ? <div className={styles.feedback} role="alert"><strong>Changes were not saved</strong><p>{failure}</p></div> : null}
    {message ? <div className={styles.feedback} role="status"><strong>Saved</strong><p>{message}</p></div> : null}
    {createFlow ? <CreateFlowActions backHref="/blogs" backLabel="Cancel" busy={busy} busyLabel={isCreate ? "Creating…" : "Saving…"} primaryLabel="Next →" primaryType="submit" /> : <div className={styles.formActions}><Button disabled={busy} type="submit">{busy ? "Saving…" : isCreate ? "Create Blog" : "Save changes"}</Button><Link className={styles.linkButton} href="/blogs">Cancel</Link></div>}
  </form>;
}
