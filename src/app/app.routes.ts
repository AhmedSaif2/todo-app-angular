import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import {
  authGuard,
  SignupComponent,
} from './auth-form/signup/signup.component';
import { LoginComponent } from './auth-form/login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'users',
    canActivate: [authGuard],
    children: [
      {
        path: ':uid/tasks',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
