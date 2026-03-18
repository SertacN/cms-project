import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
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
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'contents',
        title: 'Contents',
        loadComponent: () =>
          import('./features/contents/content-categories/content-categories').then(
            (m) => m.ContentCategories,
          ),
        children: [
          {
            path: ':categoryId',
            title: 'Contents',
            loadComponent: () =>
              import('./features/contents/contents/contents').then((m) => m.Contents),
          },
        ],
      },
      {
        path: 'settings',
        title: 'Settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
    ],
  },
];
