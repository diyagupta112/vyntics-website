export type FAQ = {
  id: string;
  page: string;
  sub_page: string | null;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type FAQCreate = Pick<FAQ, "page" | "sub_page" | "question" | "answer" | "is_active"> & { display_order?: number };
export type FAQUpdate = Partial<FAQCreate>;
