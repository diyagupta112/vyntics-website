/* eslint-disable @next/next/no-img-element */
import { createElement, type ReactNode } from "react";
import type { JsonObject, JsonValue } from "@/lib/case-studies";
import styles from "./case-study-content.module.css";

const reservedKeys = new Set(["attrs", "caption", "content", "items", "level", "marks", "text", "type"]);
function isObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeUrl(value: JsonValue | undefined) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function textFromNode(value: JsonValue): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(textFromNode).join("");
  if (!isObject(value)) return "";
  if (typeof value.text === "string") return value.text;
  if (value.content) return textFromNode(value.content);
  return Object.entries(value)
    .filter(([key]) => !reservedKeys.has(key))
    .map(([, nested]) => textFromNode(nested))
    .join(" ");
}

function markedText(value: JsonObject, key: string): ReactNode {
  let rendered: ReactNode = typeof value.text === "string" ? value.text : "";
  const marks = Array.isArray(value.marks) ? value.marks : [];

  marks.forEach((mark, index) => {
    if (!isObject(mark) || typeof mark.type !== "string") return;
    const markKey = `${key}-mark-${index}`;
    if (mark.type === "strong" || mark.type === "bold") rendered = <strong key={markKey}>{rendered}</strong>;
    if (mark.type === "em" || mark.type === "italic") rendered = <em key={markKey}>{rendered}</em>;
    if (mark.type === "code") rendered = <code key={markKey}>{rendered}</code>;
    if (mark.type === "link") {
      const markAttrs = isObject(mark.attrs) ? mark.attrs : {};
      const href = safeUrl(markAttrs.href);
      if (href) rendered = <a key={markKey} href={href} rel="noreferrer">{rendered}</a>;
    }
  });
  return <span key={key}>{rendered}</span>;
}

function renderNode(value: JsonValue, key: string): ReactNode {
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    return text ? <p key={key}>{text}</p> : null;
  }
  if (value === null || typeof value === "boolean") return null;
  if (Array.isArray(value)) {
    return value.map((item, index) => renderNode(item, `${key}-${index}`));
  }

  const attrs = isObject(value.attrs) ? value.attrs : value;
  const content = Array.isArray(value.content) ? value.content : [];
  const children = content.map((item, index) => renderNode(item, `${key}-${index}`));
  const type = typeof value.type === "string" ? value.type : "";

  if (type === "text") return markedText(value, key);
  if (type === "paragraph" || type === "paragraphNode") return <p key={key}>{children.length ? children : textFromNode(value)}</p>;
  if (type === "heading") {
    const levelValue = attrs.level ?? value.level;
    const level = typeof levelValue === "number" ? levelValue : 3;
    const headingText = children.length ? children : textFromNode(value);
    const headingLevel = Math.max(1, Math.min(6, Math.trunc(level)));
    return createElement(`h${headingLevel}`, { key }, headingText);
  }
  if (["bulletList", "bullet_list", "unorderedList"].includes(type)) return <ul key={key}>{children}</ul>;
  if (["orderedList", "ordered_list"].includes(type)) return <ol key={key}>{children}</ol>;
  if (["listItem", "list_item"].includes(type)) return <li key={key}>{children}</li>;
  if (type === "blockquote") return <blockquote key={key}>{children}</blockquote>;
  if (type === "quote") return <blockquote key={key}>{children.length ? children : textFromNode(value)}</blockquote>;
  if (type === "list" && Array.isArray(value.items)) {
    return <ul key={key}>{value.items.map((item, index) => <li key={`${key}-${index}`}>{typeof item === "string" || typeof item === "number" ? String(item) : renderNode(item, `${key}-${index}-content`)}</li>)}</ul>;
  }
  if (type === "hardBreak" || type === "hard_break") return <br key={key} />;
  if (type === "link") {
    const href = safeUrl(attrs.href ?? attrs.src);
    return href ? <a key={key} href={href} rel="noreferrer">{children.length ? children : href}</a> : children;
  }
  if (type === "image") {
    const src = safeUrl(attrs.src ?? attrs.url ?? attrs.image_url ?? attrs.imageUrl);
    const caption = typeof attrs.caption === "string" ? attrs.caption : typeof value.caption === "string" ? value.caption : undefined;
    return src ? <figure key={key}><img src={src} alt={typeof attrs.alt === "string" ? attrs.alt : "Project visual"} loading="lazy" />{caption ? <figcaption>{caption}</figcaption> : null}</figure> : null;
  }
  if (type === "video") {
    const src = safeUrl(attrs.src ?? attrs.url ?? value.video_url ?? value.videoUrl);
    const poster = safeUrl(attrs.poster ?? attrs.poster_url ?? attrs.posterUrl);
    const caption = typeof attrs.caption === "string" ? attrs.caption : typeof value.caption === "string" ? value.caption : undefined;
    return src ? <figure key={key}><video src={src} controls playsInline preload="metadata" poster={poster} aria-label={typeof attrs.alt === "string" ? attrs.alt : "Project demonstration"} />{caption ? <figcaption>{caption}</figcaption> : null}</figure> : null;
  }
  if (type === "doc" || type === "document") return <>{children}</>;
  if (children.length) return <>{children}</>;

  if (typeof value.headline === "string" || typeof value.description === "string") {
    const knownKeys = new Set(["eyebrow", "headline", "description"]);
    return <div key={key}>{typeof value.eyebrow === "string" ? <p><strong>{value.eyebrow}</strong></p> : null}{typeof value.headline === "string" ? <h3>{value.headline}</h3> : null}{typeof value.description === "string" ? <p>{value.description}</p> : null}{Object.entries(value).filter(([entryKey]) => !reservedKeys.has(entryKey) && !knownKeys.has(entryKey)).map(([, entryValue], index) => renderNode(entryValue, `${key}-value-${index}`))}</div>;
  }

  const nested = Object.entries(value)
    .filter(([entryKey]) => !reservedKeys.has(entryKey))
    .map(([, entryValue], index) => renderNode(entryValue, `${key}-value-${index}`));
  return nested.length ? nested : null;
}

export function CaseStudyContent({ content }: { content: JsonObject }) {
  // Render authored nodes in their original order; object keys are never
  // interpreted as required sections, labels, or outcome fields.
  return <div className={styles.prose}>{renderNode(content, "document")}</div>;
}
