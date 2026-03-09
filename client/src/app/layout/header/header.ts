import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/auth';
import { ThemeService } from '../../core/services/theme';

interface Breadcrumb {
  label: string;
  path: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  contents: 'İçerikler',
  settings: 'Ayarlar',
};

@Component({
  selector: 'app-header',
  imports: [RouterLink, LucideAngularModule, MatMenuModule, MatTooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) route = route.firstChild;
        return route.snapshot.title || 'Dashboard';
      }),
    ),
    { initialValue: this.getTitle() },
  );

  readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs()),
    ),
    { initialValue: this.buildBreadcrumbs() },
  );

  onLogout(): void {
    this.authService.logout().subscribe();
  }

  private getTitle(): string {
    let route = this.activatedRoute;
    while (route.firstChild) route = route.firstChild;
    return route.snapshot.title || 'Dashboard';
  }

  private buildBreadcrumbs(): Breadcrumb[] {
    const url = this.router.url.split('?')[0];
    const segments = url.split('/').filter(Boolean);
    if (segments.length <= 1) return [];

    const crumbs: Breadcrumb[] = [{ label: 'Ana Sayfa', path: '/dashboard' }];
    let path = '';
    for (const seg of segments) {
      path += '/' + seg;
      const label = ROUTE_LABELS[seg];
      if (label && seg !== 'dashboard') {
        crumbs.push({ label, path });
      }
    }
    return crumbs;
  }
}
