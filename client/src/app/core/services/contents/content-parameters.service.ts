import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ContentParametersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contents/parameters-definition`;
  private readonly headers = new HttpHeaders({
    'x-api-key': `${environment.apiKey}`,
  });

  getContentsParametersDefinition(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`, { headers: this.headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(() => new Error(`Veri yüklenemedi! (Hata Kodu: ${err.status})`));
      }),
    );
  }

  createContentsParametersDefinition(data: any[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, data, { headers: this.headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(() => new Error(`İşlem başarısız! (Hata Kodu: ${err.status})`));
      }),
    );
  }
}
