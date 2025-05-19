import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/authService.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

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
  private authService = inject(AuthService);
  private router = inject(Router);
  public isLoading = false;
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
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/users', response.user.uid, 'tasks']);
          console.log(response);
        },
        error: (err) => console.error(err),
      });
  }
}
