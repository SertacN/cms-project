import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string, duration = 3000) {
    this.open(message, 'success', duration);
  }

  error(message: string, duration = 5000) {
    this.open(message, 'error', duration);
  }

  info(message: string, duration = 3000) {
    this.open(message, 'info', duration);
  }

  warning(message: string, duration = 4000) {
    this.open(message, 'warning', duration);
  }

  private open(message: string, type: ToastType, duration: number) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: { message, type },
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: [`toast-${type}`],
    });
  }
}
