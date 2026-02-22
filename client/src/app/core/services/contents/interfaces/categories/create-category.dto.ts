import { Category } from './category.dto';

export interface CreateCategoryDto {
  title: string;
  orderBy: number;
  isActive: boolean;
}

export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  data?: Category;
}
