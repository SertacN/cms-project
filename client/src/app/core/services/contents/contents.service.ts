import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../interfaces';
import {
  Content,
  ContentDetail,
  ContentsResponse,
  ContentStatus,
} from './interfaces/content.interface';

export interface GetContentsParams {
  categoryId?: number;
  status?: ContentStatus | '';
  page?: number;
  limit?: number;
}

export interface CreatePostPayload {
  title: string;
  categoryId: number;
  summary?: string;
  content?: string;
}

export interface UpdatePostPayload {
  title?: string;
  categoryId: number;
  summary?: string;
  content?: string;
}

export interface ParameterValuePayload {
  contentId: number;
  values: { definitionId: number; value: string }[];
}

@Injectable({ providedIn: 'root' })
export class ContentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/contents/posts/admin`;
  private readonly paramsValueUrl = `${environment.apiUrl}/contents/parameters-value`;
  private readonly headers = new HttpHeaders({ 'x-api-key': `${environment.apiKey}` });

  getContents(params: GetContentsParams): Observable<ContentsResponse> {
    let httpParams = new HttpParams();
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);

    return this.http.get<ContentsResponse>(this.apiUrl, {
      headers: this.headers,
      params: httpParams,
    });
  }

  getPostById(id: number): Observable<ApiResponse<ContentDetail>> {
    return this.http.get<ApiResponse<ContentDetail>>(`${this.apiUrl}/${id}`, {
      headers: this.headers,
    });
  }

  createPost(payload: CreatePostPayload): Observable<ApiResponse<Content>> {
    return this.http.post<ApiResponse<Content>>(this.apiUrl, payload, { headers: this.headers });
  }

  updatePost(postId: number, payload: UpdatePostPayload): Observable<ApiResponse<Content>> {
    return this.http.patch<ApiResponse<Content>>(`${this.apiUrl}/${postId}`, payload, {
      headers: this.headers,
    });
  }

  saveParameterValues(payload: ParameterValuePayload): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.paramsValueUrl, payload, { headers: this.headers });
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
