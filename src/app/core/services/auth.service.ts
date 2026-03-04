import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { User, LoginRequest, TokenResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  private readonly API_URL = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  private isAuthenticatedSignal = signal<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor() {
    this.checkToken();
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => throwError(() => error))
      );
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.storage.getRefreshToken();
    return this.http.post<TokenResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    const refreshToken = this.storage.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken }).subscribe();
    }
    this.storage.clearTokens();
    this.userSubject.next(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`)
      .pipe(tap(user => this.userSubject.next(user)));
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return user?.roles?.includes(`ROLE_${role}`) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  private handleAuthentication(response: TokenResponse): void {
    this.storage.saveTokens(response.accessToken, response.refreshToken);
    this.isAuthenticatedSignal.set(true);
    this.decodeAndSetUser(response.accessToken);
  }

  private decodeAndSetUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        codigo: parseInt(payload.sub),
        nome: payload.nome,
        email: payload.email,
        roles: payload.roles || []
      };
      this.userSubject.next(user);
    } catch (e) {
      console.error('Error decoding token', e);
    }
  }

  private checkToken(): void {
    const token = this.storage.getAccessToken();
    if (token && !this.isTokenExpired(token)) {
      this.isAuthenticatedSignal.set(true);
      this.decodeAndSetUser(token);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

}
