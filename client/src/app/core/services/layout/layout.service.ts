import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'cms-sidebar-collapsed';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly sidebarCollapsed = signal<boolean>(
    localStorage.getItem(STORAGE_KEY) === 'true',
  );

  readonly mobileOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
    localStorage.setItem(STORAGE_KEY, String(this.sidebarCollapsed()));
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
