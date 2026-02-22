import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ContentCategoriesService } from '../../../core/services/contents';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SharedModule } from '../../../shared/shared-module';
import { switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateCategoryDialog } from './components/create-category-dialog/create-category-dialog';
import { EditCategoryDialog } from './components/edit-category-dialog/edit-category-dialog';
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
export class ContentCategories {
  private readonly contentCategoriesService = inject(ContentCategoriesService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  // Signals
  refreshTrigger = signal(0);
  isLoading = signal<boolean>(false);
  categories = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.contentCategoriesService.getAllCategories()),
    ),
  );
  // Create Category
  openCreateCategoryDialog() {
    const dialogRef = this.dialog.open(CreateCategoryDialog, {
      width: '500px',
      ariaLabel: 'Create Category Dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTrigger.update((v) => v + 1);
      }
    });
  }
  // Edit Category
  editCategoryDialog(categoryId: number) {
    const dialogRef = this.dialog.open(EditCategoryDialog, {
      width: '750px',
      ariaLabel: 'Edit Category Dialog',
      disableClose: true,
      data: {
        categoryId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTrigger.update((v) => v + 1);
      }
    });
  }
  // Edit Category from icon
  editCategoryActivated(id: number, e: Event, isActive?: boolean) {
    e.preventDefault();
    this.isLoading.set(true);
    this.contentCategoriesService.editCategory(id, { isActive: isActive }).subscribe({
      next: (res) => {
        console.log(res);
        this.isLoading.set(false);
        this.refreshTrigger.update((value) => value + 1);
        this.snackBar.open('Kategori Güncellendi', 'Tamam', {
          duration: 3000,
        });
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
