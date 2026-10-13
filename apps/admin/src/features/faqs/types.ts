export type FAQ = {
  id: string;
  page: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type FAQCreate = Pick<FAQ, "page" | "question" | "answer" | "display_order" | "is_active">;
export type FAQUpdate = Partial<FAQCreate>;
