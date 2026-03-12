import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
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

  // Race condition önleme — refresh devam ederken gelen 401'ler bekletilir
  isRefreshing = false;
  readonly refreshDone$ = new BehaviorSubject<boolean>(false);

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

  doRefresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {});
  }

  checkAuth(): Observable<boolean> {
    if (this._isAuthenticated()) return of(true);
    if (this._isChecking()) return of(false);

    this._isChecking.set(true);
    return this.doRefresh().pipe(
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

  // Interceptor'dan çağrılır — refresh in-flight ise bekler, değilse başlatır
  refreshToken(retryRequest: () => Observable<any>): Observable<any> {
    if (this.isRefreshing) {
      // Devam eden refresh bitince asıl isteği tekrar dene
      return this.refreshDone$.pipe(
        filter((done) => done),
        take(1),
        switchMap(() => retryRequest()),
      );
    }

    this.isRefreshing = true;
    this.refreshDone$.next(false);

    return this.doRefresh().pipe(
      switchMap(() => {
        this.isRefreshing = false;
        this.refreshDone$.next(true);
        return retryRequest();
      }),
      catchError((err) => {
        this.isRefreshing = false;
        this.refreshDone$.next(false);
        this.logout().subscribe();
        return throwError(() => err);
      }),
    );
  }
}
