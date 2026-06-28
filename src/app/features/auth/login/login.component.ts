import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

type LoginMode  = 'email' | 'username';
type FieldError = 'email' | 'username' | 'password' | 'general' | null;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  // ── Estado mutado dentro de callbacks async (subscribe) ──
  // Debe ser signal: en una app zoneless (provideZonelessChangeDetection),
  // mutar una propiedad plana dentro de un subscribe no refresca la vista
  // — el spinner se queda pegado y la navegación post-login no se refleja.
  isLoading = signal(false);
  hasError  = signal(false);
  fieldError = signal<FieldError>(null);
  errorMessage = signal('');

  // ── Estado del formulario — mutado por eventos de template, está bien
  // que sean propiedades planas (el evento del DOM sí dispara CD) ──────
  loginMode: LoginMode = 'email';

  emailValue    = '';
  usernameValue = '';
  passwordValue = '';
  showPassword  = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  toggleMode(): void {
    this.loginMode = this.loginMode === 'email' ? 'username' : 'email';
    this._clearErrors();
  }

  onSubmit(): void {
    this._clearErrors();

    // Validación básica frontend
    if (this.loginMode === 'email') {
      if (!this.emailValue.trim()) {
        this._setError('email', 'Ingresa tu correo electrónico.');
        return;
      }
    } else {
      if (!this.usernameValue.trim()) {
        this._setError('username', 'Ingresa tu usuario.');
        return;
      }
    }

    if (!this.passwordValue) {
      this._setError('password', 'Ingresa tu contraseña.');
      return;
    }

    this.isLoading.set(true);

    const login$ = this.loginMode === 'email'
      ? this.authService.loginWithEmail(this.emailValue.trim(), this.passwordValue)
      : this.authService.loginWithUsername(this.usernameValue.trim(), this.passwordValue);

    login$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = this._extractErrorMessage(err, 'Credenciales incorrectas. Intenta de nuevo.');
        // Mapeamos mensajes del backend a campos específicos
        if (msg.toLowerCase().includes('contraseña')) {
          this._setError('password', 'Contraseña incorrecta');
        } else if (msg.toLowerCase().includes('correo') || msg.toLowerCase().includes('usuario')) {
          this._setError(this.loginMode === 'email' ? 'email' : 'username', msg);
        } else {
          this._setError('general', msg);
        }
        this._triggerShake();
      }
    });
  }

  private _extractErrorMessage(err: unknown, fallback: string): string {
    const httpError = err as { error?: { message?: string }; message?: string };
    return httpError?.error?.message ?? httpError?.message ?? fallback;
  }

  private _setError(field: FieldError, message: string): void {
    this.fieldError.set(field);
    this.errorMessage.set(message);
    this.hasError.set(true);
  }

  private _clearErrors(): void {
    this.fieldError.set(null);
    this.errorMessage.set('');
    this.hasError.set(false);
  }

  private _triggerShake(): void {
    this.hasError.set(true);
    setTimeout(() => { this.hasError.set(false); }, 600);
  }
}
