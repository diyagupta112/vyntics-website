import { Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import styles from "./rich-text-editor.module.css";

function ImagePreview({ node, editor, getPos, deleteNode, extension, selected }: NodeViewProps) {
  const url = String(node.attrs.url ?? "");
  const alt = String(node.attrs.alt ?? "");
  return (
    <NodeViewWrapper className={styles.imageBlock} data-selected={selected || undefined} contentEditable={false}>
      <div className={styles.videoHeading}>
        <span>Article image</span>
        <div className={styles.videoActions}>
          <button type="button" onClick={() => {
            const position = getPos();
            if (position === undefined) return;
            editor.commands.setNodeSelection(position);
            extension.options.onEdit?.();
          }}>Edit alt text</button>
          <button type="button" onClick={deleteNode}>Remove image</button>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={alt} className={styles.imageBody} src={url} />
    </NodeViewWrapper>
  );
}

export const ContentImageNode = Node.create<{ onEdit?: () => void }>({
  name: "image",
  group: "block",
  atom: true,
  selectable: true,
  addOptions() { return { onEdit: undefined }; },
  addAttributes() { return { url: { default: null }, alt: { default: "" } }; },
  parseHTML() {
    return [{ tag: "img[data-content-image]", getAttrs: (element) => ({ url: element.getAttribute("src"), alt: element.getAttribute("alt") ?? "" }) }];
  },
  renderHTML({ node }) {
    return ["img", { "data-content-image": "", src: node.attrs.url, alt: node.attrs.alt }];
  },
  addNodeView() { return ReactNodeViewRenderer(ImagePreview); },
});
