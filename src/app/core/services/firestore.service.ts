import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  from,
  map,
  Observable,
  Subject,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { CanActivateFn, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly firestoreUrl = `https://firestore.googleapis.com/v1/projects/todo-app-29cd9/databases/(default)/documents`;
  private readonly identityUrl = `https://identitytoolkit.googleapis.com/v1/accounts`;

  private auth = inject(Auth);

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  private taskUpdateSubject = new Subject<void>();
  taskUpdates$ = this.taskUpdateSubject.asObservable();

  notifyTaskUpdated() {
    this.taskUpdateSubject.next();
  }

  constructor() {
    this.auth.onAuthStateChanged((user) => this.userSubject.next(user));
  }
  private httpClient = inject(HttpClient);
  signup(email: string, password: string): Observable<any> {
    return this.httpClient
      .post(`${this.identityUrl}:signUp?key=${environment.firebase.apiKey}`, {
        email: email,
        password: password,
        returnSecureToken: true,
      })
      .pipe(tap((res) => console.log(res)));
  }
  // this.handleAuthentiaction(res.email, res.localId, res.idToken, res.expiresIn)
  login(email: string, password: string): Observable<any> {
    return this.httpClient.post(
      `${this.identityUrl}:signInWithPassword?key=${environment.firebase.apiKey}`,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );
  }
  getTasks(userId: string): Observable<any> {
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        return from(user!.getIdToken());
      }),
      switchMap((token) => {
        const headers = this.createAuthHeaders(token);

        const url = `${this.firestoreUrl}:runQuery`;

        const query = this.buildQuery('tasks', userId);

        return this.httpClient.post(url, query, { headers }).pipe(
          map((response: any) => {
            return this.filterTasks(response);
          })
        );
      })
    );
  }
  filterTasks(response: any) {
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
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        return from(user!.getIdToken());
      }),
      switchMap((token) => {
        const headers = this.createAuthHeaders(token);

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
    return this.user$.pipe(
      take(1),
      switchMap((user) => from(user!.getIdToken())),
      switchMap((token) => {
        const headers = this.createAuthHeaders(token);
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
    return this.user$.pipe(
      take(1),
      switchMap((user) => {
        return from(user!.getIdToken());
      }),
      switchMap((token) => {
        const headers = this.createAuthHeaders(token);
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

export const authGuard: CanActivateFn = () => {
  const authService = inject(FirestoreService);
  const router = inject(Router);

  return authService.user$.pipe(
    map((user) => {
      if (user) {
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};
