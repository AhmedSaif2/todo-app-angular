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

const mockStorage = jasmine.createSpyObj('localStorage', [
  'getItem',
  'setItem',
  'removeItem',
]);
mockStorage.getItem.and.returnValue(fakeUser);

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
  });
  it('should login successfuly', async () => {
    spyOn(localStorage, 'setItem');

    service
      .login('fakeEmail', '123')
      .subscribe((response) => expect(response).toBeTruthy());

    const req = httpTesting.expectOne(
      `${identityUrl}:signInWithPassword?key=${environment.firebase.apiKey}`
    );
    expect(req.request.method).toBe('POST');
    req.flush({
      email: 'fakeEmail',
      localId: '123',
      idToken: 'fakeToken',
      expiresIn: '100',
    });
    expect(service.user.getValue()?.userId).toEqual(fakeUser.userId);
    expect(localStorage.setItem).toHaveBeenCalled();
  });
  it('should signup successfuly', async () => {
    spyOn(localStorage, 'setItem');

    service
      .signup('fakeEmail', '123')
      .subscribe((response) => expect(response).toBeTruthy());
    const req = httpTesting.expectOne(
      `${identityUrl}:signUp?key=${environment.firebase.apiKey}`
    );
    expect(req.request.method).toBe('POST');
    req.flush({
      email: 'fakeEmail',
      localId: '123',
      idToken: 'fakeToken',
      expiresIn: '3600',
    });
    expect(service.user.getValue()?.userId).toEqual(fakeUser.userId);
    expect(localStorage.setItem).toHaveBeenCalled();
  });
  it('should create a user data in local storage', async () => {
    spyOn(localStorage, 'setItem');

    service.handleAuthentiaction('fakeEmail', '123', 'fakeToken', '100');
    expect(localStorage.setItem).toHaveBeenCalled();
  });
  it('should be able to login automatically', async () => {
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(fakeUser));

    service.autoLogin();
    expect(localStorage.getItem).toHaveBeenCalledWith('userData');
  });
  it('should fail to login automatically', async () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    service.autoLogin();
    service.user.subscribe((user) => expect(user).toBeNull());
  });
  it('should logout', async () => {
    spyOn(localStorage, 'removeItem');

    service.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('userData');
  });
});
