import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, of, throwError } from 'rxjs';
import { parseIdentifier } from '../../../shared/utils';
import {
  CategoriesResponse,
  Category,
  CategoryDetailsDialog,
  CreateCategoryDto,
  EditCategoryDto,
} from './interfaces/categories';
import { ApiResponse } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ContentCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contents/categories`;
  private readonly headers = new HttpHeaders({
    'x-api-key': `${environment.apiKey}`,
  });

  private readonly _categories = signal<Category[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly categories = this._categories.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadCategories(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.http.get<CategoriesResponse>(this.apiUrl, { headers: this.headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        return of<CategoriesResponse>({
          success: false,
          message: `Veri yüklenemedi! (Hata Kodu: ${err.status})`,
          data: [],
        });
      }),
    ).subscribe((response) => {
      this._isLoading.set(false);
      if (response.success) {
        this._categories.set(response.data ?? []);
      } else {
        this._error.set(response.message);
      }
    });
  }
  // Handle by ID or SEF Url
  getCategoryDetails(identifier: string): Observable<ApiResponse<CategoryDetailsDialog>> {
    const parsedIdentifier = parseIdentifier(identifier);
    return this.http
      .get<ApiResponse<CategoryDetailsDialog>>(`${this.apiUrl}/${parsedIdentifier}`, { headers: this.headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(() => new Error(`Veri yüklenemedi! (Hata Kodu: ${err.status})`));
        }),
      );
  }
  createCategory(dto: CreateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(this.apiUrl, dto, { headers: this.headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(() => new Error(`Veri yüklenemedi! (Hata Kodu: ${err.status})`));
      }),
    );
  }
  editCategory(id: number, dto: EditCategoryDto): Observable<ApiResponse<Category>> {
    return this.http
      .patch<ApiResponse<Category>>(`${this.apiUrl}/${id}`, dto, { headers: this.headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(() => new Error(`Veri yüklenemedi! (Hata Kodu: ${err.status})`));
        }),
      );
  }
  deleteCategory(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`, { headers: this.headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(() => new Error(`Veri silinemedi! (Hata Kodu: ${err.status})`));
      }),
    );
  }
}
