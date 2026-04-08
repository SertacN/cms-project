export interface Category {
  id: number;
  title: string;
  sefUrl: string;
  orderBy: number;
  children?: [
    {
      id: number;
      title: string;
      isActive: boolean;
    },
  ];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface CategoriesResponse {
  success: boolean;
  message: string;
  data?: Category[];
}
