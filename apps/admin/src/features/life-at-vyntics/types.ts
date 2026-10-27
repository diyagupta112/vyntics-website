export type LifeAtVyntics = {
  id: string;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

/** Omitting display_order appends the image; a position inserts it and the backend shifts the rest. */
export type LifeAtVynticsCreateRequest = { display_order?: number };

export type LifeAtVynticsUpdateRequest = { display_order: number };
