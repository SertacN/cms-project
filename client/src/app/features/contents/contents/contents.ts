import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { LucideAngularModule } from 'lucide-angular';
import { ContentsService } from '../../../core/services/contents/contents.service';
import { ToastService } from '../../../core/services/toast';
import { Content, ContentStatus, CONTENT_STATUS_LABEL } from '../../../core/services/contents/interfaces/content.interface';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-contents',
  imports: [
    DatePipe,
    LowerCasePipe,
    LucideAngularModule,
    MatButtonModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './contents.html',
  styleUrl: './contents.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contents {
  private readonly contentsService = inject(ContentsService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  // Route'dan gelen kategori ID'si
  readonly categoryId = input<string>();

  readonly contents = signal<Content[]>([]);
  readonly isLoading = signal(false);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly statusFilter = signal<ContentStatus | ''>('');

  readonly statusOptions: { value: ContentStatus | ''; label: string }[] = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'DRAFT', label: 'Taslak' },
    { value: 'PUBLISHED', label: 'Yayında' },
    { value: 'ARCHIVED', label: 'Arşivlendi' },
  ];

  readonly statusLabel = CONTENT_STATUS_LABEL;

  constructor() {
    // categoryId, page, limit veya statusFilter değişince yeniden yükle
    effect(() => {
      const catId = this.categoryId();
      if (catId) this.fetchContents();
    });
  }

  fetchContents(): void {
    this.isLoading.set(true);
    this.contentsService
      .getContents({
        categoryId: this.categoryId() ? Number(this.categoryId()) : undefined,
        status: this.statusFilter() || undefined,
        page: this.page(),
        limit: this.limit(),
      })
      .subscribe({
        next: (res) => {
          this.contents.set(res.data ?? []);
          this.total.set(res.meta?.total ?? 0);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.limit.set(event.pageSize);
    this.fetchContents();
  }

  onStatusChange(value: ContentStatus | ''): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.fetchContents();
  }

  changeStatus(content: Content, status: ContentStatus): void {
    this.contentsService.updateStatus(content.id, status).subscribe({
      next: () => {
        this.toast.success(`Durum "${this.statusLabel[status]}" olarak güncellendi`);
        this.fetchContents();
      },
    });
  }

  async openDeleteConfirm(content: Content): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'İçeriği Sil',
        message: `"${content.title}" içeriğini silmek istediğinize emin misiniz?`,
        confirmText: 'Sil',
        danger: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.contentsService.deleteContent(content.id).subscribe({
        next: () => {
          this.toast.success('İçerik silindi');
          this.fetchContents();
        },
      });
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/contents/new'], {
      queryParams: { categoryId: this.categoryId() },
    });
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/contents', id, 'edit']);
  }

  getAvailableStatuses(current: ContentStatus): { value: ContentStatus; label: string }[] {
    return (['DRAFT', 'PUBLISHED', 'ARCHIVED'] as ContentStatus[])
      .filter((s) => s !== current)
      .map((s) => ({ value: s, label: this.statusLabel[s] }));
  }

  trackById(_: number, item: Content): number {
    return item.id;
  }
}
