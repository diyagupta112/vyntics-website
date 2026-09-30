import type { ReactNode } from "react";
import type { JsonObject, JsonValue } from "@/lib/careers";
import styles from "./structured-content.module.css";

type ContentVariant = "prose" | "list";

const metadataKeys = new Set(["attrs", "marks", "type"]);

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textFromNode(node: JsonValue): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (!isObject(node)) return "";
  if (typeof node.text === "string" || typeof node.text === "number") {
    return String(node.text);
  }
  return node.content ? textFromNode(node.content) : "";
}

function hasRenderableValue(value: JsonValue, key?: string): boolean {
  if (typeof value === "string") {
    return key !== "type" && value.trim().length > 0;
  }
  if (typeof value === "number") return true;
  if (value === null || typeof value === "boolean") return false;
  if (Array.isArray(value)) return value.some((item) => hasRenderableValue(item));

  return Object.entries(value).some(
    ([entryKey, entryValue]) =>
      !metadataKeys.has(entryKey) && hasRenderableValue(entryValue, entryKey),
  );
}

function renderNode(node: JsonValue, key: string): ReactNode {
  if (typeof node === "string") {
    const text = node.trim();
    return text ? <p key={key}>{text}</p> : null;
  }
  if (typeof node === "number") return <p key={key}>{node}</p>;
  if (!isObject(node)) return null;

  const content = Array.isArray(node.content) ? node.content : [];
  const children = content.map((child, index) => renderNode(child, `${key}-${index}`));

  if (node.type === "text") {
    return typeof node.text === "string" || typeof node.text === "number"
      ? String(node.text)
      : null;
  }
  if (node.type === "paragraph" || node.type === "paragraphNode") {
    return <p key={key}>{children}</p>;
  }
  if (node.type === "heading") {
    const level =
      isObject(node.attrs) && typeof node.attrs.level === "number"
        ? node.attrs.level
        : 3;
    const text = textFromNode(content);
    return level <= 3 ? <h3 key={key}>{text}</h3> : <h4 key={key}>{text}</h4>;
  }
  if (
    node.type === "bulletList" ||
    node.type === "bullet_list" ||
    node.type === "unorderedList" ||
    node.type === "orderedList" ||
    node.type === "ordered_list"
  ) {
    const ListTag =
      node.type === "orderedList" || node.type === "ordered_list" ? "ol" : "ul";
    return <ListTag key={key}>{children}</ListTag>;
  }
  if (node.type === "listItem" || node.type === "list_item") {
    return <li key={key}>{children.length ? children : textFromNode(node)}</li>;
  }
  if (node.type === "blockquote") return <blockquote key={key}>{children}</blockquote>;
  if (node.type === "hardBreak" || node.type === "hard_break") return <br key={key} />;
  if (node.type === "codeBlock" || node.type === "code_block") {
    return <pre key={key}><code>{textFromNode(node)}</code></pre>;
  }
  if (node.type === "doc" || node.type === "document") {
    return <div key={key}>{children}</div>;
  }
  if (children.length) return <div key={key}>{children}</div>;

  const text = textFromNode(node).trim();
  return text ? <p key={key}>{text}</p> : null;
}

function meaningfulValues(value: JsonObject): JsonValue[] {
  return Object.entries(value)
    .filter(
      ([key, entryValue]) =>
        !metadataKeys.has(key) && hasRenderableValue(entryValue, key),
    )
    .map(([, entryValue]) => entryValue);
}

function collectListItems(value: JsonValue): JsonValue[] {
  if (!hasRenderableValue(value)) return [];
  if (Array.isArray(value)) return value.flatMap(collectListItems);
  if (!isObject(value) || typeof value.type === "string") return [value];
  if (Array.isArray(value.items)) return collectListItems(value.items);
  return meaningfulValues(value).flatMap(collectListItems);
}

function renderListItem(value: JsonValue, key: string): ReactNode {
  if (typeof value === "string" || typeof value === "number") {
    return <li key={key}>{value}</li>;
  }
  return <li key={key}>{renderProse(value, `${key}-content`)}</li>;
}

function renderProse(value: JsonValue, key: string): ReactNode {
  if (typeof value === "string") {
    const text = value.trim();
    return text ? <p key={key}>{text}</p> : null;
  }
  if (typeof value === "number") return <p key={key}>{value}</p>;
  if (value === null || typeof value === "boolean") return null;

  if (Array.isArray(value)) {
    const items = collectListItems(value);
    return items.length ? (
      <ul key={key}>
        {items.map((item, index) => renderListItem(item, `${key}-${index}`))}
      </ul>
    ) : null;
  }
  if (typeof value.type === "string") return renderNode(value, key);
  if (Array.isArray(value.paragraphs)) {
    return (
      <div key={key}>
        {value.paragraphs.map((paragraph, index) =>
          renderProse(paragraph, `${key}-paragraph-${index}`),
        )}
      </div>
    );
  }
  if (Array.isArray(value.items)) return renderProse(value.items, `${key}-items`);

  const values = meaningfulValues(value);
  return values.length ? (
    <div key={key}>
      {values.map((entryValue, index) =>
        renderProse(entryValue, `${key}-value-${index}`),
      )}
    </div>
  ) : null;
}

export function hasStructuredContent(value: JsonValue): boolean {
  return hasRenderableValue(value);
}

export function StructuredContent({
  value,
  variant = "prose",
}: {
  value: JsonValue;
  variant?: ContentVariant;
}) {
  const content =
    variant === "list" ? (
      <ul>
        {collectListItems(value).map((item, index) =>
          renderListItem(item, `item-${index}`),
        )}
      </ul>
    ) : (
      renderProse(value, "content")
    );

  return <div className={styles.content}>{content}</div>;
}
