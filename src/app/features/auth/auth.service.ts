import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/auth/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly identityUrl = `https://identitytoolkit.googleapis.com/v1/accounts`;

  router = inject(Router);
  user = new BehaviorSubject<User | null>(null);

  constructor() {}
  private httpClient = inject(HttpClient);

  signup(email: string, password: string): Observable<any> {
    return this.httpClient
      .post(`${this.identityUrl}:signUp?key=${environment.firebase.apiKey}`, {
        email: email,
        password: password,
        returnSecureToken: true,
      })
      .pipe(
        tap((res: any) => {
          this.handleAuthentiaction(
            res.email,
            res.localId,
            res.idToken,
            res.expiresIn
          );
        })
      );
  }
  login(email: string, password: string): Observable<any> {
    return this.httpClient
      .post(
        `${this.identityUrl}:signInWithPassword?key=${environment.firebase.apiKey}`,
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        tap((res: any) => {
          this.handleAuthentiaction(
            res.email,
            res.localId,
            res.idToken,
            res.expiresIn
          );
        })
      );
  }
  handleAuthentiaction(
    email: string,
    userId: string,
    token: string,
    expiresIn: string
  ) {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const userData = new User(email, userId, token, expirationDate);

    this.user.next(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  }
  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData')!);
    if (!userData) {
      return;
    }
    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );
    if (loadedUser.token) {
      this.user.next(loadedUser);
    }
  }
  logout() {
    this.user.next(null);
    localStorage.removeItem('userData');
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
