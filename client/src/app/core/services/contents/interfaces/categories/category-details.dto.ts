export interface CategoryDetailsResponse {
  success: boolean;
  message: string;
  data?: {};
}
export interface CategoryDetailsDialog {
  title?: string;
  sefUrl?: string;
  orderBy?: number;
  isActive?: boolean;
}
