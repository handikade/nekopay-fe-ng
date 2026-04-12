import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.layout').then((m) => m.DashboardLayout),
    children: [
      {
        path: 'summary',
        loadComponent: () => import('./features/summary/summary.page').then((m) => m.SummaryPage),
      },
      {
        path: 'sales-invoice',
        loadComponent: () =>
          import('./features/invoice-sales/invoice-sales.page').then((m) => m.InvoiceSalesPage),
      },
      {
        path: 'product',
        loadComponent: () => import('./features/product/product.page').then((m) => m.ProductPage),
      },
      {
        path: 'partner',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/partner/list/partner-list.page').then((m) => m.PartnerListPage),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/partner/create/partner-create.page').then(
                (m) => m.PartnerCreatePage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/partner/detail/partner-detail.page').then(
                (m) => m.PartnerDetailPage,
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
