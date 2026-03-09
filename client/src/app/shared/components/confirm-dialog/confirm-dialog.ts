import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon [class.danger-icon]="data.danger">{{ data.danger ? 'warning' : 'help_outline' }}</mat-icon>
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ data.cancelText ?? 'İptal' }}</button>
      <button
        mat-flat-button
        [color]="data.danger ? 'warn' : 'primary'"
        (click)="confirm()"
      >
        {{ data.confirmText ?? 'Onayla' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .danger-icon {
      color: #f44336;
    }
    mat-dialog-content p {
      margin: 0;
      color: rgba(0, 0, 0, 0.7);
    }
  `,
})
export class ConfirmDialog {
  private dialogRef = inject(MatDialogRef<ConfirmDialog>);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
