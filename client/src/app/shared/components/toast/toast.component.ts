import { computed, Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { ToastType } from '../../../core/services/toast';

interface ToastData {
  message: string;
  type: ToastType;
}

const ICONS: Record<ToastType, string> = {
  success: 'check',
  error: 'circle-alert',
  info: 'info',
  warning: 'triangle-alert',
};

@Component({
  selector: 'app-toast',
  imports: [LucideAngularModule],
  template: `
    <div class="toast-content">
      <lucide-icon [name]="icon()" [size]="18" />
      <span class="toast-message">{{ data.message }}</span>
      <button class="toast-dismiss" (click)="dismiss()">
        <lucide-icon name="x" [size]="14" />
      </button>
    </div>
  `,
  styles: [`
    .toast-content {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.125rem 0;
    }
    .toast-message {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .toast-dismiss {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      opacity: 0.7;
      color: inherit;
      padding: 2px;
      border-radius: 4px;
    }
    .toast-dismiss:hover { opacity: 1; }
  `],
})
export class ToastComponent {
  readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  private readonly ref = inject(MatSnackBarRef);

  readonly icon = computed(() => ICONS[this.data.type]);

  dismiss() {
    this.ref.dismiss();
  }
}
