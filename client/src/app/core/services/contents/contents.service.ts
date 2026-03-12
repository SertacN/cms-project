import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../interfaces';
import { Content, ContentStatus, ContentsResponse } from './interfaces/content.interface';

export interface GetContentsParams {
  categoryId?: number;
  status?: ContentStatus | '';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ContentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contents/posts/admin`;
  private readonly headers = new HttpHeaders({ 'x-api-key': `${environment.apiKey}` });

  getContents(params: GetContentsParams): Observable<ContentsResponse> {
    let httpParams = new HttpParams();
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<ContentsResponse>(this.apiUrl, { headers: this.headers, params: httpParams });
  }

  updateStatus(id: number, status: ContentStatus): Observable<ApiResponse<Content>> {
    return this.http.patch<ApiResponse<Content>>(
      `${this.apiUrl}/${id}/status`,
      { status },
      { headers: this.headers },
    );
  }

  deleteContent(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }
}
