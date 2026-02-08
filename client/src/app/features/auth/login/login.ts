import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';
import { email, form, FormField, required } from '@angular/forms/signals';
import { AuthService } from '../../../core/auth';
import { LoginRequest } from '../../../core/auth/interfaces';

@Component({
  selector: 'app-login',
  imports: [SharedModule, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);

  // Validation
  loginModel = signal<LoginRequest>({
    email: '',
    password: '',
  });
  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'Email is Required' });
    email(schemaPath.email, { message: 'Enter a valid email address' });
    required(schemaPath.password, { message: 'Password is Required' });
  });
  // Signals
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isPasswordVisible = signal<boolean>(false);

  // Methods
  onSubmit(e: Event): void {
    e.preventDefault();
    const credintial = this.loginModel();
    this.isLoading.set(true);
    this.authService.login(credintial).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success !== 1) {
          this.errorMessage.set(response.message || 'Login sırasında bir hata oluştu');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message.message || 'Beklenmeyen bir hata oluştu');
      },
    });
  }

  changePasswordVisible() {
    this.isPasswordVisible.set(!this.isPasswordVisible());
  }

  clearServerErrorMessage() {
    this.errorMessage.set(null);
  }
}
