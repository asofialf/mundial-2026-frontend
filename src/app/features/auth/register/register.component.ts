import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

type FieldError = 'email' | 'password' | 'name' | 'alias' | 'avatar' | 'general' | null;

interface Avatar {
  key:   string;
  emoji: string;
  label: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  // Estado mutado dentro de callbacks async (subscribe) -> debe ser signal
  // en una app zoneless, o la vista nunca se refresca cuando llega la
  // respuesta HTTP (el spinner se queda pegado, el paso nunca avanza).
  step      = signal(1);
  isLoading = signal(false);
  fieldError = signal<FieldError>(null);
  errorMessage = signal('');

  // Paso 1 — mutados solo por eventos de template (ngModel/click), está
  // bien que sean propiedades planas: el evento del DOM sí dispara CD.
  email    = '';
  password = '';
  showPassword = false;

  // Paso 2
  name           = '';
  alias          = '';
  selectedAvatar = 'ball';

  // userId guardado entre pasos
  private createdUserId: number | null = null;

  // Avatares predefinidos
  // El campo `key` es lo que se manda como `icon` al backend
  // Ajusta los valores según lo que acepte tu backend
  readonly AVATARS: Avatar[] = [
    { key: 'ball',     emoji: '⚽', label: 'Balón' },
    { key: 'trophy',   emoji: '🏆', label: 'Trofeo' },
    { key: 'star',     emoji: '⭐', label: 'Estrella' },
    { key: 'fire',     emoji: '🔥', label: 'Fuego' },
    { key: 'lion',     emoji: '🦁', label: 'León' },
    { key: 'eagle',    emoji: '🦅', label: 'Águila' },
    { key: 'rocket',   emoji: '🚀', label: 'Cohete' },
    { key: 'lightning',emoji: '⚡', label: 'Rayo' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  goToStep(step: number): void {
    this.step.set(step);
  }

  // ── Paso 1: crear usuario ────────────────────────────────
  onStep1Submit(): void {
    this._clearErrors();

    if (!this.email.trim()) {
      this._setError('email', 'Ingresa tu correo.');
      return;
    }
    if (!this.password) {
      this._setError('password', 'Ingresa una contraseña.');
      return;
    }

    this.isLoading.set(true);

    this.authService.createUser(this.email.trim(), this.password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        // El backend retorna el userId — ajusta el campo según la respuesta real
        this.createdUserId = (res['userId'] ?? res['user_id'] ?? res['id']) as number;
        this.step.set(2);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = this._extractErrorMessage(err, 'Error al crear la cuenta.');
        if (msg.toLowerCase().includes('correo')) {
          this._setError('email', msg);
        } else if (msg.toLowerCase().includes('contraseña')) {
          this._setError('password', msg);
        } else {
          this._setError('general', msg);
        }
      }
    });
  }

  // ── Paso 2: crear perfil ─────────────────────────────────
  onStep2Submit(): void {
    this._clearErrors();

    if (!this.name.trim()) {
      this._setError('name', 'Ingresa tu nombre.');
      return;
    }
    if (!this.alias.trim()) {
      this._setError('alias', 'Ingresa un alias.');
      return;
    }
    if (!this.selectedAvatar) {
      this._setError('avatar', 'Elige un avatar.');
      return;
    }

    if (!this.createdUserId) {
      this._setError('general', 'Sesión inválida. Vuelve al paso anterior.');
      return;
    }

    this.isLoading.set(true);

    this.authService.createProfile(
      this.createdUserId,
      this.name.trim(),
      this.alias.trim(),
      this.selectedAvatar
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login'], {
          queryParams: { registered: 'true' }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this._setError('general', this._extractErrorMessage(err, 'Error al crear el perfil.'));
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
  }

  private _clearErrors(): void {
    this.fieldError.set(null);
    this.errorMessage.set('');
  }
}
