export type CmsBlockType =
  | 'hero'
  | 'text'
  | 'image'
  | 'gallery'
  | 'cta'
  | 'tourGrid'
  | 'blogGrid'
  | 'customHtml'
  | 'reusable'
  | 'container';

export type CmsBlockNode = {
  id: string;
  type: CmsBlockType;
  props?: Record<string, unknown>;
  children?: CmsBlockNode[];
};

export type ReusableBlockMap = Record<string, CmsBlockNode[]>;
