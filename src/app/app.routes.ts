import { Routes } from '@angular/router';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/services/firestore.service';

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
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
