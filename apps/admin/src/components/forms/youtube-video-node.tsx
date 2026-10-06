import { Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { YOUTUBE_VIDEO_ID } from "./youtube-video";
import styles from "./rich-text-editor.module.css";

function VideoPreview({ node, editor, getPos, deleteNode, extension, selected }: NodeViewProps) {
  const id = String(node.attrs.video_id ?? "");
  return (
    <NodeViewWrapper className={styles.videoBlock} data-selected={selected || undefined} contentEditable={false}>
      <div className={styles.videoHeading}>
        <span>YouTube video</span>
        <div className={styles.videoActions}>
          <button type="button" onClick={() => {
            const position = getPos();
            if (position === undefined) return;
            editor.commands.setNodeSelection(position);
            extension.options.onEdit?.();
          }}>Edit video</button>
          <button type="button" onClick={deleteNode}>Remove video</button>
        </div>
      </div>
      {YOUTUBE_VIDEO_ID.test(id) ? (
        <div className={styles.videoFrame}>
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title="YouTube video preview" loading="lazy" allowFullScreen />
        </div>
      ) : <p role="alert">This video reference is invalid.</p>}
    </NodeViewWrapper>
  );
}

export const YouTubeVideoNode = Node.create<{ onEdit?: () => void }>({
  name: "video",
  group: "block",
  atom: true,
  selectable: true,
  addOptions() { return { onEdit: undefined }; },
  addAttributes() {
    return { provider: { default: "youtube" }, video_id: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'div[data-youtube-video]', getAttrs: (element) => ({ provider: "youtube", video_id: element.getAttribute("data-youtube-video") }) }];
  },
  renderHTML({ node }) {
    return ["div", { "data-youtube-video": node.attrs.video_id }, "YouTube video"];
  },
  addNodeView() { return ReactNodeViewRenderer(VideoPreview); },
});
