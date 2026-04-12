import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { email, form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RegisterRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'register-page',
  imports: [
    ReactiveFormsModule,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="register-container" data-testid="register-page">
      <mat-card class="register-card">
        @if (isLoading()) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
          <mat-card-subtitle>Create a new account to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form (submit)="onSubmit($event)">
            <fieldset [disabled]="isLoading()" class="form-fieldset">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username</mat-label>
                <input
                  matInput
                  [formField]="registerForm.username"
                  placeholder="Enter username"
                  data-testid="register-username"
                />
                @if (registerForm.username().touched() && registerForm.username().invalid()) {
                  <mat-error data-testid="register-username-error">{{
                    registerForm.username().errors()[0]?.message
                  }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input
                  matInput
                  type="email"
                  [formField]="registerForm.email"
                  placeholder="Enter email"
                  data-testid="register-email"
                />
                @if (registerForm.email().touched() && registerForm.email().invalid()) {
                  <mat-error data-testid="register-email-error">{{
                    registerForm.email().errors()[0]?.message
                  }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  [type]="hidePassword() ? 'password' : 'text'"
                  [formField]="registerForm.password"
                  placeholder="Enter password"
                  data-testid="register-password"
                />
                <button
                  type="button"
                  mat-icon-button
                  matSuffix
                  (click)="hidePassword.set(!hidePassword())"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword()"
                  [disabled]="isLoading()"
                  data-testid="register-password-toggle"
                >
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (registerForm.password().touched() && registerForm.password().invalid()) {
                  <mat-error data-testid="register-password-error">{{
                    registerForm.password().errors()[0]?.message
                  }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone Number (Optional)</mat-label>
                <input
                  matInput
                  [formField]="registerForm.phone_number"
                  placeholder="Enter phone number"
                  data-testid="register-phone"
                />
              </mat-form-field>

              <button
                mat-flat-button
                color="primary"
                type="submit"
                class="full-width register-button"
                [disabled]="registerForm().invalid() || isLoading()"
                data-testid="register-submit"
              >
                @if (isLoading()) {
                  Registering...
                } @else {
                  Register
                }
              </button>

              <div class="login-link">
                Already have an account?
                <a routerLink="/login" data-testid="register-login-link">Login</a>
              </div>
            </fieldset>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      padding: 0;
      overflow: hidden;
    }

    mat-card-header {
      padding: 24px 24px 0;
      margin-bottom: 24px;
      text-align: center;
      display: block;
    }

    mat-card-content {
      padding: 0 24px 24px;
    }

    .form-fieldset {
      border: none;
      padding: 0;
      margin: 0;
    }

    .full-width {
      width: 100%;
    }

    .register-button {
      margin-top: 16px;
      padding: 24px 0;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .login-link {
      margin-top: 16px;
      text-align: center;
      font-size: 14px;
    }
  `,
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  hidePassword = signal(true);
  isLoading = signal(false);

  registerModel = signal<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    phone_number: '',
  });

  registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' });
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Invalid email address' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, { message: 'Password must be at least 8 characters' });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.registerForm, async () => {
      this.isLoading.set(true);
      try {
        const response = await firstValueFrom(this.authService.register(this.registerModel()));
        this.snackBar.open(response.message || 'Registration successful!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        await this.router.navigate(['/login']);
      } catch (err: unknown) {
        console.error('Registration error:', err);
        this.snackBar.open(
          (err as { error: { message: string } }).error?.message ||
            'Registration failed. Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          },
        );
        throw err;
      } finally {
        this.isLoading.set(false);
      }
    });
  }
}
