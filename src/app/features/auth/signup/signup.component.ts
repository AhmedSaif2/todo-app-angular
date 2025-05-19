import { Component, inject } from '@angular/core';
import {
  EmailValidator,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../core/services/authService.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  public isLoading = false;
  signupForm = new FormGroup({
    fullName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });
  onSubmit() {
    this.isLoading = true;
    this.authService
      .signup(this.signupForm.value.email!, this.signupForm.value.password!)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/users', response.user.uid, 'tasks']);
        },
        error: (err) => console.error(err),
      });
  }
}

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
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
