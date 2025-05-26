import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { finalize } from 'rxjs';
import { AuthService } from '../auth.service';
import { MatStepperModule } from '@angular/material/stepper';
import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, LoadingSpinnerComponent, MatStepperModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  isLoading = false;
  error = false;
  stepperOrientation: 'horizontal' | 'vertical' = 'horizontal';
  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe(Breakpoints.Handset).subscribe((result) => {
      this.stepperOrientation = result.matches ? 'vertical' : 'horizontal';
    });
  }
  userInfoForm = new FormGroup({
    firstName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    lastName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });
  signupForm = new FormGroup({
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
      .signup(
        this.userInfoForm.value.firstName!,
        this.userInfoForm.value.lastName!,
        this.signupForm.value.email!,
        this.signupForm.value.password!
      )
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/users', response.localId, 'tasks'], {
            replaceUrl: true,
          });
        },
        error: (err) => {
          this.error = true;
          console.error(err);
        },
      });
  }
}
