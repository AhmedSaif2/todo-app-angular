import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  map,
  Observable,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../features/auth/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly firestoreUrl = `https://firestore.googleapis.com/v1/projects/todo-app-29cd9/databases/(default)/documents`;
  private readonly identityUrl = `https://identitytoolkit.googleapis.com/v1/accounts`;

  router = inject(Router);
  user = new BehaviorSubject<User | null>(null);

  private taskUpdateSubject = new Subject<void>();
  taskUpdates$ = this.taskUpdateSubject.asObservable();

  notifyTaskUpdated() {
    this.taskUpdateSubject.next();
  }

  constructor() {}
  private httpClient = inject(HttpClient);

  // TODO: Move auth logic to another service
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
    this.router.navigate(['/login']);
  }
  getTasks(userId: string): Observable<any> {
    console.log(userId);
    return this.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('User is not authenticated.');
        }
        const headers = this.createAuthHeaders(user.token!);

        const url = `${this.firestoreUrl}:runQuery`;

        const query = this.buildQuery('tasks', userId);

        return this.httpClient.post(url, query, { headers }).pipe(
          map((response: any) => {
            return this.handleFirestoreResponse(response);
          })
        );
      })
    );
  }
  handleFirestoreResponse(response: any) {
    if (response[0].document == undefined) {
      return [];
    }
    return response.map((task: any) => {
      const fields = task.document.fields;
      return {
        id: task.document.name.split('/').pop(),
        title: fields.title.stringValue,
        description: fields.description.stringValue,
        state: fields.state.stringValue,
        userId: fields.userId.stringValue,
        priority: fields.priority.stringValue,
      };
    });
  }
  addNewTask(task: any): Observable<any> {
    return this.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('User is not authenticated.');
        }
        const headers = this.createAuthHeaders(user.token!);

        const body = {
          fields: {
            title: { stringValue: task.title },
            description: { stringValue: task.description },
            userId: { stringValue: task.userId },
            state: { stringValue: task.state },
            priority: { stringValue: task.priority },
          },
        };
        const url = `${this.firestoreUrl}/tasks`;
        return this.httpClient.post(url, body, { headers });
      })
    );
  }
  updateTask(id: string, state: string, userId: string): Observable<any> {
    return this.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('User is not authenticated.');
        }
        const headers = this.createAuthHeaders(user.token!);
        const body = {
          fields: {
            state: { stringValue: state },
          },
        };
        const url = `${this.firestoreUrl}/tasks/${id}?updateMask.fieldPaths=state`;

        return this.httpClient.patch(url, body, { headers }).pipe(
          tap(() => this.getTasks(userId)) // Refresh task list
        );
      })
    );
  }
  public deleteTask(id: string): Observable<any> {
    return this.user.pipe(
      take(1),

      switchMap((user) => {
        if (!user) {
          throw new Error('User is not authenticated.');
        }
        const headers = this.createAuthHeaders(user.token!);
        const url = `${this.firestoreUrl}/tasks/${id}`;
        return this.httpClient.delete(url, { headers });
      })
    );
  }

  buildQuery(collection: string, userId: string) {
    return {
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'userId' },
            op: 'EQUAL',
            value: { stringValue: userId },
          },
        },
      },
    };
  }
  createAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }
}
