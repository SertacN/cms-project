import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ContentCategoriesService } from '../../../core/services/contents';
import { SharedModule } from '../../../shared/shared-module';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-content-categories',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SharedModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './content-categories.html',
  styleUrl: './content-categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCategories implements OnInit {
  private readonly contentCategoriesService = inject(ContentCategoriesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly categories = this.contentCategoriesService.categories;
  readonly isLoading = this.contentCategoriesService.isLoading;
  readonly error = this.contentCategoriesService.error;

  ngOnInit() {
    this.contentCategoriesService.loadCategories();
  }

  // Create Category
  async openCreateCategoryDialog() {
    const { CreateCategoryDialog } = await import(
      './components/create-category-dialog/create-category-dialog'
    );
    const dialogRef = this.dialog.open(CreateCategoryDialog, {
      width: '1000px',
      ariaLabel: 'Create Category Dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.contentCategoriesService.loadCategories();
      }
    });
  }

  // Edit Category
  async editCategoryDialog(categoryId: number) {
    const { EditCategoryDialog } = await import(
      './components/edit-category-dialog/edit-category-dialog'
    );
    const dialogRef = this.dialog.open(EditCategoryDialog, {
      width: '1000px',
      ariaLabel: 'Edit Category Dialog',
      disableClose: true,
      data: { categoryId },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.contentCategoriesService.loadCategories();
      }
    });
  }

  // Edit Category from icon
  editCategoryActivated(id: number, e: Event, isActive?: boolean) {
    e.preventDefault();
    this.contentCategoriesService.editCategory(id, { isActive }).subscribe({
      next: () => {
        this.contentCategoriesService.loadCategories();
        this.snackBar.open('Kategori Güncellendi', 'Tamam', { duration: 3000 });
      },
    });
  }
}
