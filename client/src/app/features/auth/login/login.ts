import { Component, inject, LOCALE_ID, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth';
import { LoginRequest } from '../../../core/auth/interfaces';

@Component({
  selector: 'app-login',
  imports: [LucideAngularModule, FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly localeId = inject(LOCALE_ID);

  readonly currentLang = this.localeId === 'en' ? 'en' : 'tr';
  readonly targetLang = this.currentLang === 'tr' ? 'en' : 'tr';
  readonly targetLangLabel = this.currentLang === 'tr' ? 'EN' : 'TR';

  switchLanguage() {
    const pathWithoutLang = window.location.pathname.replace(/^\/(tr|en)/, '');
    window.location.href = `/${this.targetLang}${pathWithoutLang}`;
  }

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
        if (response.success === 1) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set(
            response.message || $localize`:@@loginError:Login sırasında bir hata oluştu`,
          );
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message.message || $localize`:@@unexpectedError:Beklenmeyen bir hata oluştu`,
        );
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
