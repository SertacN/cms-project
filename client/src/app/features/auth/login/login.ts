import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { LoginRequest } from '../../../core/interfaces';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  credentials: LoginRequest = {
    email: '',
    password: '',
  };

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage.set('Lütfen email ve şifre giriniz.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success !== 1) {
          this.errorMessage.set(response.message || 'Giriş başarısız.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message.message || 'Giriş yapılırken bir hata oluştu.');
      },
    });
  }
}
