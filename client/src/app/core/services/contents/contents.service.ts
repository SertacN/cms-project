import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, of } from 'rxjs';
import { CategoriesResponse } from './interfaces/category.dto';

@Injectable({
  providedIn: 'root',
})
export class ContentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contents/categories`;
  private readonly headers = new HttpHeaders({
    'x-api-key': `${environment.apiKey}`,
  });
  getAllCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(this.apiUrl, { headers: this.headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('API Hatası:', err);
        const errorResponse: CategoriesResponse = {
          success: false,
          message: `Veri yüklenemedi! (Hata Kodu: ${err.status})`,
          data: [],
        };
        return of(errorResponse);
      }),
    );
  }
}
