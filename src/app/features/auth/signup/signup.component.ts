import { Component, inject } from '@angular/core';
import {
  EmailValidator,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FirestoreService } from '../../../core/services/firestore.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private authService = inject(FirestoreService);
  private router = inject(Router);
  isLoading = false;
  error = false;

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
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/users', response.localId, 'tasks']);
        },
        error: (err) => {
          this.error = true;
          console.error(err);
        },
      });
  }
}
