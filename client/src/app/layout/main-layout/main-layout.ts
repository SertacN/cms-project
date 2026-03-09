import { Component, inject, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { LayoutService } from '../../core/services/layout';
import { LoadingBarService } from '../../core/services/loading-bar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar, MatProgressBarModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  readonly layoutService = inject(LayoutService);
  readonly loadingBar = inject(LoadingBarService);
  private readonly router = inject(Router);

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingBar.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingBar.hide();
      }
    });
  }
}
