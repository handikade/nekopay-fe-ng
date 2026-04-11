import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    children: [
      {
        path: 'summary',
        loadComponent: () =>
          import('./features/dashboard/pages/summary.component').then((m) => m.SummaryComponent),
      },
      {
        path: 'sales-invoice',
        loadComponent: () =>
          import('./features/dashboard/pages/sales-invoice.component').then(
            (m) => m.SalesInvoiceComponent,
          ),
      },
      {
        path: 'product',
        loadComponent: () =>
          import('./features/dashboard/pages/product.component').then((m) => m.ProductComponent),
      },
      {
        path: 'partner',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/partner/partner.component').then((m) => m.PartnerComponent),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/partner/partner-create.component').then(
                (m) => m.PartnerCreateComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/partner/partner-detail.component').then(
                (m) => m.PartnerDetailComponent,
              ),
          },
        ],
      },
      {
        path: '',
        redirectTo: 'summary',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
