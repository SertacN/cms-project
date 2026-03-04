export type Public<T> = Omit<T, 'isDeleted' | 'deletedAt'>;

// Servislerin döndürdüğü iç tip — interceptor success ve timestamp ekler
export interface ServiceResponse<T = unknown> {
  message: string;
  data?: T;
  meta?: object;
}

// Client'ın gördüğü nihai response tipi
export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
  meta?: object;
  timestamp: string;
}
