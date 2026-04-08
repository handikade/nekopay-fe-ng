import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-sidenav-container class="sidenav-container" autosize>
      <!-- SIDENAV -->
      <mat-sidenav
        #drawer
        class="sidenav"
        [attr.role]="'navigation'"
        [mode]="'side'"
        [opened]="true"
        [style.width.px]="isExpanded() ? 240 : 70"
      >
        <mat-toolbar>
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="toggleSidenav()"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
        </mat-toolbar>
        <mat-nav-list>
          @for (item of menuItems; track item.path) {
            <a mat-list-item [routerLink]="item.path" routerLinkActive="active-link">
              <mat-icon matListItemIcon [title]="isExpanded() ? '' : item.label">
                {{ item.icon }}
              </mat-icon>
              @if (isExpanded()) {
                <span matListItemTitle>{{ item.label }}</span>
              }
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>
      <!-- end of SIDENAV -->

      <!-- SIDENAV CONTENT -->
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span>NekoPay Dashboard</span>
          <span class="spacer"></span>
          <button mat-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-toolbar>

        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
      <!-- end of SIDENAV CONTENT -->
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      --mat-list-active-indicator-shape: 0px;
      // --mat-toolbar-container-background-color: var(--mat-sys-surface-dim);
    }

    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      transition: width 0.2s;
      overflow-x: hidden;
      background-color: var(--mat-sys-surface-container);
      border-right: 1px solid var(--mat-sys-outline-variant);
      --mat-sidenav-container-shape: 0;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .content {
      padding: 24px;
    }

    .active-link {
      background: rgba(0, 0, 0, 0.1);
      color: #3f51b5;
    }

    .mat-drawer-content {
      overflow-y: scroll;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1;
    }
  `,
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isExpanded = signal(true);

  menuItems = [
    { path: 'summary', label: 'Summary', icon: 'dashboard' },
    { path: 'sales-invoice', label: 'Sales Invoice', icon: 'receipt' },
    { path: 'product', label: 'Product', icon: 'inventory_2' },
    { path: 'partner', label: 'Partner', icon: 'handshake' },
  ];

  toggleSidenav() {
    this.isExpanded.update((val) => !val);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/login']);
      },
    });
  }
}
