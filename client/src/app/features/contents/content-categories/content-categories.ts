import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ContentCategoriesService } from '../../../core/services/contents';
import { LucideAngularModule } from 'lucide-angular';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-content-categories',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  templateUrl: './content-categories.html',
  styleUrl: './content-categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCategories {
  private readonly contentCategoriesService = inject(ContentCategoriesService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  readonly categories = this.contentCategoriesService.categories;
  readonly isLoading = this.contentCategoriesService.isLoading;
  readonly error = this.contentCategoriesService.error;

  readonly searchQuery = signal('');

  readonly filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.categories();
    return this.categories().filter((c) => c.title.toLowerCase().includes(q));
  });

  ngOnInit() {
    this.contentCategoriesService.loadCategories();
  }

  async openCreateCategoryDialog() {
    const { CreateCategoryDialog } = await import(
      './components/create-category-dialog/create-category-dialog'
    );
    const dialogRef = this.dialog.open(CreateCategoryDialog, {
      width: '600px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.contentCategoriesService.loadCategories();
    });
  }

  async editCategoryDialog(categoryId: number) {
    const { EditCategoryDialog } = await import(
      './components/edit-category-dialog/edit-category-dialog'
    );
    const dialogRef = this.dialog.open(EditCategoryDialog, {
      width: '1000px',
      disableClose: true,
      data: { categoryId },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.contentCategoriesService.loadCategories();
    });
  }

  editCategoryActivated(id: number, isActive: boolean) {
    this.contentCategoriesService.editCategory(id, { isActive }).subscribe({
      next: () => {
        this.contentCategoriesService.loadCategories();
        this.toast.success(isActive ? 'Kategori aktif edildi' : 'Kategori pasif edildi');
      },
    });
  }
}
