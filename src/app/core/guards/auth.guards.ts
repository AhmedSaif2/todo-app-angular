import { CanActivateFn, Router } from '@angular/router';
import { FirestoreService } from '../services/firestore.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(FirestoreService);
  const router = inject(Router);
  return authService.user.pipe(
    map((user) => {
      if (user) {
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};
