import type { RelatedService } from "@/lib/content/related-services";

export type CaseStudyStatus = "draft" | "published" | "unpublished";

export type CaseStudy = {
  id: string;
  related_services: RelatedService[];
  related_sub_services: string[];
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  client_name: string;
  excerpt: string;
  cover_image_url: string | null;
  tech_stack: string[];
  tags: string[];
  content: Record<string, unknown>;
  featured: boolean;
  status: CaseStudyStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseStudyCreateRequest = {
  related_services: RelatedService[];
  related_sub_services: string[];
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  client_name: string;
  excerpt: string;
  cover_image_url: null;
  tech_stack: string[];
  tags: string[];
  content: Record<string, unknown>;
  featured: boolean;
  status: Exclude<CaseStudyStatus, "published">;
};

export type CaseStudyUpdateRequest = Partial<
  Omit<CaseStudyCreateRequest, "cover_image_url" | "status"> & {
    status: CaseStudyStatus;
  }
>;
