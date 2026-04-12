import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, firstValueFrom, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly STORAGE_KEY = 'access_token';

  private readonly _accessToken = signal<string | null>(
    !environment.production ? localStorage.getItem(this.STORAGE_KEY) : null,
  );
  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken());

  private refreshInProgress$: Observable<LoginResponse | null> | null = null;

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, credentials, {
        withCredentials: environment.production,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.data.accessToken);
        }),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: environment.production })
      .pipe(
        tap(() => {
          this.clearToken();
        }),
      );
  }

  refresh(): Observable<LoginResponse | null> {
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    this.refreshInProgress$ = this.http
      .post<LoginResponse>(
        `${this.baseUrl}/refresh`,
        {},
        { withCredentials: environment.production },
      )
      .pipe(
        tap((response) => {
          this.setToken(response.data.accessToken);
        }),
        catchError(() => {
          this.clearToken();
          return of(null);
        }),
        finalize(() => {
          this.refreshInProgress$ = null;
        }),
        shareReplay(1),
      );

    return this.refreshInProgress$;
  }

  async initializeAuth(): Promise<void> {
    if (!environment.production && this.accessToken()) {
      return;
    }
    await firstValueFrom(this.refresh());
  }

  private setToken(token: string): void {
    this._accessToken.set(token);
    if (!environment.production) {
      localStorage.setItem(this.STORAGE_KEY, token);
    }
  }

  private clearToken(): void {
    this._accessToken.set(null);
    if (!environment.production) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
