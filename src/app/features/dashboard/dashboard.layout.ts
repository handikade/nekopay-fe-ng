import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@src/app/core/services/auth.service';

@Component({
  selector: 'dashboard-layout',
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
    <mat-sidenav-container class="h-screen" data-testid="dashboard-sidenav-container" autosize>
      <!-- SIDENAV -->
      <mat-sidenav
        #drawer
        class="sidenav transition-[width] duration-200 overflow-x-hidden"
        [attr.role]="'navigation'"
        [mode]="'side'"
        [opened]="true"
        [style.width.px]="isExpanded() ? 240 : 70"
        data-testid="dashboard-sidenav"
      >
        <mat-toolbar class="sticky top-0 z-1">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="toggleSidenav()"
            data-testid="dashboard-toggle-sidenav"
          >
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
        </mat-toolbar>
        <mat-nav-list>
          @for (item of menuItems; track item.path) {
            <a
              mat-list-item
              [routerLink]="item.path"
              routerLinkActive="bg-black/10 text-[#3f51b5]"
              [attr.data-testid]="'dashboard-nav-item-' + item.path"
            >
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
      <mat-sidenav-content class="overflow-y-auto">
        <mat-toolbar color="primary" class="sticky top-0 z-1" data-testid="dashboard-toolbar">
          <span>NekoPay Dashboard</span>
          <span class="flex-1"></span>
          <button mat-button (click)="logout()" data-testid="dashboard-logout-button">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-toolbar>

        <div class="p-6">
          <router-outlet />
        </div>
      </mat-sidenav-content>
      <!-- end of SIDENAV CONTENT -->
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      --mat-list-active-indicator-shape: 0px;
    }

    .sidenav {
      background-color: var(--mat-sys-surface-container);
      border-right: 1px solid var(--mat-sys-outline-variant);
      --mat-sidenav-container-shape: 0;
    }
  `,
})
export class DashboardLayout {
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
