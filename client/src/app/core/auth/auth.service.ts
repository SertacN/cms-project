import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private _isAuthenticated = signal<boolean>(false);
  isAuthenticated = computed(() => this._isAuthenticated());
  private _isChecking = signal<boolean>(false);
  isChecking = computed(() => this._isChecking());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.success === 1) {
          this._isAuthenticated.set(true);
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
    if (this._isAuthenticated()) return of(true);
    if (this._isChecking()) return of(false); // Or handle concurrent calls better

    this._isChecking.set(true);
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
      tap(() => this._isChecking.set(false)),
    );
  }
}
