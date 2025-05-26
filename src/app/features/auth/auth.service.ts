import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  first,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/auth/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly identityUrl = `https://identitytoolkit.googleapis.com/v1/accounts`;
  private readonly firestoreUrl = `https://firestore.googleapis.com/v1/projects/todo-app-29cd9/databases/(default)/documents`;

  router = inject(Router);
  user = new BehaviorSubject<User | null>(null);

  constructor() {}
  private httpClient = inject(HttpClient);

  signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Observable<any> {
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
          const body = {
            fields: {
              firstName: { stringValue: firstName },
              lastName: { stringValue: lastName },
              email: { stringValue: res.email },
              id: { stringValue: res.localId },
            },
          };
          console.log(body);
          this.httpClient
            .patch(`${this.firestoreUrl}/users/${res.localId}`, body)
            .subscribe();
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
      userId: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData')!);
    if (!userData) {
      return;
    }
    const loadedUser = new User(
      userData.email,
      userData.userId,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );
    if (loadedUser.token) {
      this.user.next(loadedUser);
      this.router.navigate(['/users', loadedUser.userId, 'tasks']);
    }
  }
  logout() {
    this.user.next(null);
    localStorage.removeItem('userData');
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
