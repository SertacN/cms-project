import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private _isAuthenticated = signal<boolean>(false);
  isAuthenticated = computed(() => this._isAuthenticated());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.success === 1) {
          this._isAuthenticated.set(true);
          this.router.navigate(['/dashboard']);
        }
      }),
    );
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this._isAuthenticated.set(false);
        this.router.navigate(['/']);
      }),
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {});
  }

  checkAuth(): Observable<boolean> {
    return this.refreshToken().pipe(
      map((response) => {
        const isAuth = response.success === 1;
        this._isAuthenticated.set(isAuth);
        return isAuth;
      }),
      catchError(() => {
        this._isAuthenticated.set(false);
        return of(false);
      }),
    );
  }
}
