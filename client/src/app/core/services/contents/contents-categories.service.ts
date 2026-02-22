import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, of, throwError } from 'rxjs';
import { parseIdentifier } from '../../../shared/utils';
import {
  CategoriesResponse,
  Category,
  CategoryDetailsResponse,
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
  getAllCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(this.apiUrl, { headers: this.headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('API Hatası:', err.status);
        const errorResponse: CategoriesResponse = {
          success: false,
          message: `Veri yüklenemedi! (Hata Kodu: ${err.status})`,
          data: [],
        };
        return of(errorResponse);
      }),
    );
  }
  // Handle by ID or SEF Url
  getCategoryDetails(identifier: string): Observable<ApiResponse<CategoryDetailsResponse>> {
    const parsedIdentifier = parseIdentifier(identifier);
    return this.http
      .get<
        ApiResponse<CategoryDetailsResponse>
      >(`${this.apiUrl}/${parsedIdentifier}`, { headers: this.headers })
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
  editCategory(id: number, dto: EditCategoryDto): Observable<ApiResponse<EditCategoryDto>> {
    return this.http
      .patch<ApiResponse<EditCategoryDto>>(`${this.apiUrl}/${id}`, dto, { headers: this.headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(() => new Error(`Veri yüklenemedi! (Hata Kodu: ${err.status})`));
        }),
      );
  }
}
