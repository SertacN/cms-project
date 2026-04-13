import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth';
import { LayoutService } from '../../core/services/layout';
import { ThemeService } from '../../core/services/theme';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  readonly layoutService = inject(LayoutService);
  readonly themeService = inject(ThemeService);

  readonly navItems: NavItem[] = [
    { path: '/dashboard', label: $localize`:@@navDashboard:Dashboard`, icon: 'layout-dashboard' },
    { path: '/contents', label: $localize`:@@navContents:İçerikler`, icon: 'file-text' },
    { path: '/settings', label: $localize`:@@navSettings:Ayarlar`, icon: 'settings' },
  ];

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
