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

  private readonly _accessToken = signal<string | null>(null);
  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken());

  private refreshInProgress$: Observable<LoginResponse | null> | null = null;

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this._accessToken.set(response.accessToken);
        }),
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this._accessToken.set(null);
      }),
    );
  }

  refresh(): Observable<LoginResponse | null> {
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    this.refreshInProgress$ = this.http
      .post<LoginResponse>(`${this.baseUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          this._accessToken.set(response.accessToken);
        }),
        catchError(() => {
          this._accessToken.set(null);
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
    await firstValueFrom(this.refresh());
  }
}
