export interface EditCategoryDto {
  title?: string;
  orderBy?: number;
  isActive?: boolean;
  sefUrl?: string;
}

export interface EditCategoryResponse {
  success: boolean;
  message: string;
  data: EditCategoryDto;
}
