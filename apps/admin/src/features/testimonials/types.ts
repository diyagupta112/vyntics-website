export type Testimonial = {
  id: string;
  quote: string;
  author_name: string;
  author_role: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type TestimonialCreate = Pick<Testimonial, "quote" | "author_name" | "author_role" | "company_name" | "company_logo_url" | "is_active"> & { display_order?: number };
export type TestimonialUpdate = Partial<TestimonialCreate>;
