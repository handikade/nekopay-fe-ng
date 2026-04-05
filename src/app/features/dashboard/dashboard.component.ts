import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <button mat-flat-button color="warn" (click)="logout()">Logout</button>
    </div>
  `,
  styles: `
    .dashboard-container {
      padding: 24px;
    }
  `,
})
export class DashboardComponent {
  private readonly router = inject(Router);

  logout() {
    this.router.navigate(['/login']);
  }
}
