import { TestBed } from '@angular/core/testing';

import { FirestoreService } from './firestore.service';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, config, firstValueFrom, of } from 'rxjs';
import { User } from '../../features/auth/user.model';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

const fakeUser = new User('fakeEmail', '123', 'fakeToken', new Date());

const mockResponse = [
  {
    document: {
      name: 'task123',
      fields: {
        title: { stringValue: 'Test Task' },
        description: { stringValue: 'Test Description' },
        userId: { stringValue: '123' },
        state: { stringValue: 'Pending' },
        priority: { stringValue: 'Low' },
      },
    },
  },
];

const mockTasks = [
  {
    id: 'task123',
    title: 'Test Task',
    description: 'Test Description',
    state: 'Pending',
    priority: 'Low',
    userId: '123',
  },
];

describe('FirestoreService', () => {
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/todo-app-29cd9/databases/(default)/documents`;

  let httpTesting: HttpTestingController;
  let service: FirestoreService;

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(fakeUser));

    TestBed.configureTestingModule({
      providers: [
        FirestoreService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(FirestoreService);
    //service.user = new BehaviorSubject<User | null>(fakeUser);
  });

  afterEach(() => {
    localStorage.clear();
  });
  // Inject the http service and test controller for each test
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should return tasks', async () => {
    service.getTasks('123').subscribe((tasks) => {
      console.log('Tasks: ', tasks);
      expect(tasks).toEqual(mockTasks);
    });
    const req = httpTesting.expectOne(
      `${firestoreUrl}:runQuery`,
      'Request to load the tasks'
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    // Await the result to ensure completion

    httpTesting.verify();
  });
  it('should return and empty list', async () => {
    service.getTasks('123').subscribe((tasks) => {
      console.log('Tasks: ', tasks);
      expect(tasks).toEqual([]);
    });
    const req = httpTesting.expectOne(
      `${firestoreUrl}:runQuery`,
      'Request to load the tasks'
    );
    expect(req.request.method).toBe('POST');
    req.flush([
      {
        name: '',
      },
    ]);
  });

  it('should add a new task', async () => {
    service
      .addNewTask({
        title: 'Test Task',
        description: 'Test Description',
        userId: '123',
        state: 'Pending',
        priority: 'Low',
      })
      .subscribe((response) => {
        expect(response).toBeTruthy();
      });
    const req = httpTesting.expectOne(
      `${firestoreUrl}/tasks`,
      'Request to add a new task'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      fields: {
        title: { stringValue: 'Test Task' },
        description: { stringValue: 'Test Description' },
        userId: { stringValue: '123' },
        state: { stringValue: 'Pending' },
        priority: { stringValue: 'Low' },
      },
    });
    httpTesting.verify();
  });

  it('should update a task', async () => {
    service.updateTask('task123', 'Completed', '123').subscribe((response) => {
      expect(response).toBeTruthy();
    });
    const req = httpTesting.expectOne(
      `${firestoreUrl}/tasks/task123?updateMask.fieldPaths=state`,
      'Request to update a task'
    );
    expect(req.request.method).toBe('PATCH');
  });
  it('should delete a task', async () => {
    service.deleteTask('task123').subscribe((response) => {
      expect(response).toBeTruthy();
    });
    const req = httpTesting.expectOne(
      `${firestoreUrl}/tasks/task123`,
      'Request to update a task'
    );
    expect(req.request.method).toBe('DELETE');
  });
});
