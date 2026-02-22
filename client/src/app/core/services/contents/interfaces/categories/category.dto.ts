export interface Category {
  id: number;
  title: string;
  sefUrl: string;
  orderBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface CategoriesResponse {
  success: boolean;
  message: string;
  data?: Category[];
}
