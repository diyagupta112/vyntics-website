import type { Metadata } from "next";

import { ContentGuidelinesPage } from "@/features/content-guidelines/components/content-guidelines-page";

export const metadata: Metadata = { title: "Content Guidelines" };

export default function ContentGuidelinesRoute() {
  return <ContentGuidelinesPage />;
}
