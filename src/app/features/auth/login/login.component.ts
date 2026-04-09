import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        @if (isLoading()) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
          <mat-card-subtitle>Enter your credentials to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form (submit)="onSubmit($event)">
            <fieldset [disabled]="isLoading()" class="form-fieldset">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username or Email</mat-label>
                <input
                  matInput
                  [formField]="loginForm.identifier"
                  placeholder="Enter username or email"
                />
                @if (loginForm.identifier().touched() && loginForm.identifier().invalid()) {
                  <mat-error>{{ loginForm.identifier().errors()[0]?.message }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  [type]="hidePassword() ? 'password' : 'text'"
                  [formField]="loginForm.password"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  mat-icon-button
                  matSuffix
                  (click)="hidePassword.set(!hidePassword())"
                  [attr.aria-label]="'Hide password'"
                  [attr.aria-pressed]="hidePassword()"
                  [disabled]="isLoading()"
                >
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.password().touched() && loginForm.password().invalid()) {
                  <mat-error>{{ loginForm.password().errors()[0]?.message }}</mat-error>
                }
              </mat-form-field>

              <button
                mat-flat-button
                color="primary"
                type="submit"
                class="full-width login-button"
                [disabled]="loginForm().invalid() || isLoading()"
              >
                @if (isLoading()) {
                  Logging in...
                } @else {
                  Login
                }
              </button>
            </fieldset>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
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

    .login-button {
      margin-top: 16px;
      padding: 24px 0;
    }

    mat-card-header {
      margin-bottom: 24px;
      text-align: center;
      display: block;
    }

    mat-form-field {
      margin-bottom: 8px;
    }
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  hidePassword = signal(true);
  isLoading = signal(false);

  loginModel = signal<LoginRequest>({
    identifier: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.identifier, { message: 'Username or email is required' });
    required(schemaPath.password, { message: 'Password is required' });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    submit(this.loginForm, async () => {
      this.isLoading.set(true);
      try {
        await firstValueFrom(this.authService.login(this.loginModel()));
        await this.router.navigate(['/dashboard']);
      } catch (err: unknown) {
        console.error('Login error:', err);
        this.snackBar.open(
          (err as { error: { message: string } }).error?.message ||
            'Login failed. Please try again.',
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
