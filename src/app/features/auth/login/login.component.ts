import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
          <mat-card-subtitle>Enter your credentials to continue</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form (submit)="onSubmit($event)">
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
              [disabled]="loginForm().invalid()"
            >
              Login
            </button>
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
      padding: 24px;
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

  hidePassword = signal(true);

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
      return new Promise<void>((resolve, reject) => {
        this.authService.login(this.loginModel()).subscribe({
          next: (response) => {
            console.log('Login success:', response);
            this.router.navigate(['/dashboard']);
            resolve();
          },
          error: (err) => {
            console.error('Login error:', err);
            reject(err);
          },
        });
      });
    });
  }
}
