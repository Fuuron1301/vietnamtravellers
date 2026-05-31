export type CmsMenuLinkedPost = {
  id: string;
  title: string;
  slug: string;
  postType: string;
};

export type CmsMenuItem = {
  id: string;
  label: string;
  href: string;
  target: string;
  cssClasses: string[];
  linkedPost: CmsMenuLinkedPost | null;
  children: CmsMenuItem[];
};

export type CmsMenuTree = {
  id: string;
  name: string;
  slug: string;
  location: string;
  updatedAt: string;
  items: CmsMenuItem[];
};
