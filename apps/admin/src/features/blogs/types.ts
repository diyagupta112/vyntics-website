export type BlogStatus = "draft" | "published" | "unpublished";

export type Blog = {
  id: string;
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  author: string;
  category: string;
  excerpt: string;
  cover_image_url: string | null;
  read_time: number;
  content: Record<string, unknown>;
  is_featured: boolean;
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogCreateRequest = {
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  author: string;
  category: string;
  excerpt: string;
  cover_image_url: null;
  read_time: number;
  content: Record<string, unknown>;
  is_featured: boolean;
  status: Exclude<BlogStatus, "published">;
};

export type BlogUpdateRequest = Partial<
  Omit<BlogCreateRequest, "cover_image_url" | "status"> & { status: BlogStatus }
>;
