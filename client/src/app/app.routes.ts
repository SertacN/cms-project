import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'contents',
        title: 'Contents',
        loadComponent: () =>
          import('./pages/contents/content-categories/content-categories').then(
            (m) => m.ContentCategories,
          ),
        children: [
          {
            path: ':categoryId',
            title: 'Contents',
            loadComponent: () =>
              import('./pages/contents/contents/contents').then((m) => m.Contents),
          },
        ],
      },
    ],
  },
];
