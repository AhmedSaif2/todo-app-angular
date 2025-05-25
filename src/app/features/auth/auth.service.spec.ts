import { TestBed } from '@angular/core/testing';

import { HttpClient, provideHttpClient } from '@angular/common/http';
import { BehaviorSubject, config, firstValueFrom, of } from 'rxjs';
import { User } from '../../features/auth/user.model';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

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

describe('AuthService', () => {
  const identityUrl = `https://identitytoolkit.googleapis.com/v1/accounts`;

  let httpTesting: HttpTestingController;
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);

    //service.user = new BehaviorSubject<User | null>(fakeUser);
  });

  afterEach(() => {
    localStorage.clear();
  });
  // Inject the http service and test controller for each test

  it('should login successfuly', async () => {
    service
      .login('fakeEmail', '123')
      .subscribe((response) => expect(response).toBeTruthy());
    const req = httpTesting.expectOne(
      `${identityUrl}:signInWithPassword?key=${environment.firebase.apiKey}`
    );
    expect(req.request.method).toBe('POST');
  });
  it('should signup successfuly', async () => {
    service
      .signup('fakeEmail', '123')
      .subscribe((response) => expect(response).toBeTruthy());
    const req = httpTesting.expectOne(
      `${identityUrl}:signUp?key=${environment.firebase.apiKey}`
    );
    expect(req.request.method).toBe('POST');
  });
  it('should create a user data in local storage', async () => {
    service.handleAuthentiaction('fakeEmail', '123', 'fakeToken', '100');
    expect(localStorage.getItem('userData')).toBeTruthy();
  });
  it('should try to login automatically', async () => {
    localStorage.setItem('userData', JSON.stringify(fakeUser));
    service.autoLogin();
    expect(localStorage.getItem('userData')).toBeTruthy();
  });
  it('should logout', async () => {
    localStorage.setItem('userData', JSON.stringify(fakeUser));
    service.logout();
    expect(localStorage.getItem('userData')).toBeNull();
  });
});
