import { Component, inject, NgZone } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FirestoreService } from '../../../core/services/firestore.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(FirestoreService);
  private router = inject(Router);
  isLoading = false;
  error = false;

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  onSubmit() {
    this.isLoading = true;
    this.authService
      .login(this.loginForm.value.email!, this.loginForm.value.password!)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.router.navigate(['/users', response.localId, 'tasks']);
        },
        error: (err) => {
          this.error = true;
          console.error(err);
        },
      });
  }
}
