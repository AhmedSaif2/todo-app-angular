import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly firestoreUrl = `https://firestore.googleapis.com/v1/projects/todo-app-29cd9/databases/(default)/documents`;

  private taskUpdateSubject = new Subject<void>();
  taskUpdates$ = this.taskUpdateSubject.asObservable();

  notifyTaskUpdated() {
    this.taskUpdateSubject.next();
  }

  constructor() {}
  private httpClient = inject(HttpClient);
  getTasks(userId: string): Observable<any> {
    const token = JSON.parse(localStorage.getItem('userData')!)._token;
    console.log(token);

    const headers = this.createAuthHeaders(token);

    const url = `${this.firestoreUrl}:runQuery`;

    const query = this.buildQuery('tasks', userId);

    return this.httpClient.post(url, query, { headers }).pipe(
      map((response: any) => {
        return this.handleFirestoreResponse(response);
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
    const token = JSON.parse(localStorage.getItem('userData')!)._token;
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
  }
  updateTask(id: string, state: string, userId: string): Observable<any> {
    const token = JSON.parse(localStorage.getItem('userData')!)._token;
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
  }
  public deleteTask(id: string): Observable<any> {
    const token = JSON.parse(localStorage.getItem('userData')!)._token;
    const headers = this.createAuthHeaders(token);
    const url = `${this.firestoreUrl}/tasks/${id}`;
    return this.httpClient.delete(url, { headers });
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
