export type NavigationItem = {
  label: string;
  href: string;
  children?: readonly NavigationChild[];
};

export type NavigationChild = {
  label: string;
  href: string;
  description: string;
  headingOnly?: boolean;
  children?: readonly NavigationChild[];
};
