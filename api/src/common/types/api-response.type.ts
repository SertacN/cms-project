export type Public<T> = Omit<T, 'isDeleted' | 'deletedAt'>;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: object;
}
