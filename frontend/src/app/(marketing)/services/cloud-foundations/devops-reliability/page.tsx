import { CloudSubServicePage } from "@/components/service-sub/cloud-sub-service-page";
import { cloudSubPages } from "@/content/cloud-sub-services/pages";
import { cloudSubMetadata } from "@/content/cloud-sub-services/seo";

export const metadata = cloudSubMetadata(cloudSubPages.devops);

export default function Page() {
  return <CloudSubServicePage pageKey="devops" />;
}
