"use client";

import { useEffect, useRef } from "react";
import styles from "./rich-text-editor.module.css";

type JsonNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
  content?: JsonNode[];
};

type Props = { id: string; value: string; onChange: (value: string) => void; invalid?: boolean };
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function nodeToHtml(node: JsonNode): string {
  if (node.type === "text") {
    let html = escapeHtml(node.text ?? "");
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold" || mark.type === "strong") html = "<strong>" + html + "</strong>";
      if (mark.type === "italic" || mark.type === "em") html = "<em>" + html + "</em>";
      if (mark.type === "link") html = '<a href="' + escapeHtml(String(mark.attrs?.href ?? "")) + '">' + html + "</a>";
    }
    return html;
  }
  if (node.type === "hardBreak") return "<br>";
  const content = (node.content ?? []).map(nodeToHtml).join("");
  if (node.type === "heading") {
    const level = Math.min(3, Math.max(1, Number(node.attrs?.level) || 2));
    return "<h" + level + ">" + content + "</h" + level + ">";
  }
  if (node.type === "bulletList") return "<ul>" + content + "</ul>";
  if (node.type === "orderedList") return "<ol>" + content + "</ol>";
  if (node.type === "listItem") return "<li>" + content + "</li>";
  if (node.type === "paragraph") return "<p>" + (content || "<br>") + "</p>";
  return content;
}

export function structuredContentToHtml(value: string): string {
  try {
    const root = JSON.parse(value) as JsonNode;
    return (root.content ?? []).map(nodeToHtml).join("");
  } catch {
    return "";
  }
}

function inlineNodes(node: Node, marks: JsonNode["marks"] = []): JsonNode[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ? [{ type: "text", text: node.textContent, ...(marks?.length ? { marks } : {}) }] : [];
  }
  if (!(node instanceof HTMLElement)) return [];
  const tag = node.tagName.toLowerCase();
  if (tag === "br") return [{ type: "hardBreak" }];
  const nextMarks = [...(marks ?? [])];
  if (tag === "strong" || tag === "b") nextMarks.push({ type: "bold" });
  if (tag === "em" || tag === "i") nextMarks.push({ type: "italic" });
  if (tag === "a") nextMarks.push({ type: "link", attrs: { href: node.getAttribute("href") ?? "" } });
  return Array.from(node.childNodes).flatMap((child) => inlineNodes(child, nextMarks));
}

function blockNode(element: HTMLElement): JsonNode | null {
  const tag = element.tagName.toLowerCase();
  if (/^h[1-3]$/.test(tag)) return { type: "heading", attrs: { level: Number(tag[1]) }, content: inlineNodes(element) };
  if (tag === "ul" || tag === "ol") {
    return {
      type: tag === "ul" ? "bulletList" : "orderedList",
      content: Array.from(element.children)
        .filter((child) => child.tagName === "LI")
        .map((child) => ({ type: "listItem", content: [{ type: "paragraph", content: inlineNodes(child) }] })),
    };
  }
  if (tag === "p" || tag === "div") return { type: "paragraph", content: inlineNodes(element) };
  return null;
}

export function htmlToStructuredContent(container: HTMLElement): string {
  const content = Array.from(container.children)
    .map((element) => blockNode(element as HTMLElement))
    .filter((node): node is JsonNode => Boolean(node));
  if (!content.length && container.textContent?.trim()) content.push({ type: "paragraph", content: inlineNodes(container) });
  return JSON.stringify({ type: "doc", content }, null, 2);
}

export function RichTextEditor({ id, value, onChange, invalid = false }: Props) {
  const editor = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);
  useEffect(() => {
    if (editor.current && value !== lastValue.current) editor.current.innerHTML = structuredContentToHtml(value);
    lastValue.current = value;
  }, [value]);

  function command(name: string, argument?: string) {
    editor.current?.focus();
    document.execCommand(name, false, argument);
    if (editor.current) onChange(htmlToStructuredContent(editor.current));
  }

  function addLink() {
    const url = window.prompt("Enter the link URL");
    if (url) command("createLink", url);
  }

  return <div className={styles.editor}>
    <div aria-label="Content formatting" className={styles.toolbar} role="toolbar">
      <button onClick={() => command("formatBlock", "p")} type="button">Paragraph</button>
      {[1, 2, 3].map((level) => <button key={level} onClick={() => command("formatBlock", "h" + level)} type="button">H{level}</button>)}
      <button aria-label="Bold" onClick={() => command("bold")} type="button"><strong>B</strong></button>
      <button aria-label="Italic" onClick={() => command("italic")} type="button"><em>I</em></button>
      <button onClick={addLink} type="button">Link</button>
      <button onClick={() => command("insertUnorderedList")} type="button">Bulleted list</button>
      <button onClick={() => command("insertOrderedList")} type="button">Numbered list</button>
    </div>
    <div aria-invalid={invalid} aria-multiline="true" className={styles.surface} contentEditable dangerouslySetInnerHTML={{ __html: structuredContentToHtml(value) }} id={id} onInput={(event) => onChange(htmlToStructuredContent(event.currentTarget))} role="textbox" suppressContentEditableWarning />
  </div>;
}
