export type CareerListItem = {
  id: string;
  slug: string;
  title: string;
  location: string;
  employment_type: string;
  department: string;
  experience: string;
  short_description: string;
  published_at: string;
};

export type Career = CareerListItem & {
  description: Record<string, unknown>;
  responsibilities: Record<string, unknown>;
  requirements: Record<string, unknown>;
  nice_to_have: Record<string, unknown>;
  benefits: Record<string, unknown>;
};

export type CareerListResponse = {
  data: CareerListItem[];
};

export type CareerCreateRequest = {
  slug: string;
  title: string;
  location: string;
  employment_type: string;
  department: string;
  experience: string;
  short_description: string;
  description: Record<string, unknown>;
  responsibilities: Record<string, unknown>;
  requirements: Record<string, unknown>;
  nice_to_have: Record<string, unknown>;
  benefits: Record<string, unknown>;
};

export type CareerUpdateRequest = Partial<CareerCreateRequest>;
