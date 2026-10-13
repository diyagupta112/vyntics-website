import { Suspense } from "react";
import { PreviewDocument } from "@/components/preview/preview-document";

export default function PreviewPage() {
  return <Suspense fallback={<p role="status">Loading Preview…</p>}><PreviewDocument /></Suspense>;
}
