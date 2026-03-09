import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  imports: [LucideAngularModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <lucide-icon [name]="icon()" [size]="32" />
      </div>
      <p class="empty-title">{{ title() }}</p>
      @if (description()) {
        <p class="empty-description">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <button mat-stroked-button (click)="action.emit()">{{ actionLabel() }}</button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.625rem;
      padding: 3rem 1rem;
      color: var(--color-on-surface-muted);
      text-align: center;
    }
    .empty-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: var(--color-surface-2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.25rem;
    }
    .empty-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--color-on-surface);
      margin: 0;
    }
    .empty-description {
      font-size: 0.875rem;
      margin: 0;
      max-width: 300px;
    }
  `],
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Veri bulunamadı');
  readonly description = input('');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
