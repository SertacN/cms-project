export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  DRAFT: 'Taslak',
  PUBLISHED: 'Yayında',
  ARCHIVED: 'Arşivlendi',
};

export interface Content {
  id: number;
  title: string;
  sefUrl: string;
  status: ContentStatus;
  isActive: boolean;
  orderBy: number;
  categoryId: number;
  category?: { id: number; title: string; sefUrl: string };
  createdAt: string;
  updatedAt: string;
}

export interface ContentMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContentsResponse {
  success: boolean;
  message: string;
  data: Content[];
  meta: ContentMeta;
}

export interface ContentParameterValue {
  id: number;
  value: string;
  definitionId: number;
}

export interface ContentDetail extends Content {
  summary: string | null;
  content: string | null;
  parameters: ContentParameterValue[];
}
