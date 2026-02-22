import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { ContentCategoriesService } from '../../../../../core/services/contents';
import { EditCategoryDto } from '../../../../../core/services/contents/interfaces';
import { MatAnchor } from '@angular/material/button';
import { EditCategoryDialogInterface } from '../../interfaces';

@Component({
  selector: 'app-edit-category-dialog',
  imports: [FormsModule, MatDialogActions, MatAnchor],
  templateUrl: './edit-category-dialog.html',
  styleUrl: './edit-category-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoryDialog {
  private dialogRef = inject(MatDialogRef<EditCategoryDialog>);
  private fb = inject(FormBuilder);
  private contentCategoriesService = inject(ContentCategoriesService);
  private data = inject<EditCategoryDialogInterface>(MAT_DIALOG_DATA);
  // Signals
  isLoading = signal<boolean>(false);
  editingId = signal<number | null>(null);
  // Init
  ngOnInit() {
    this.editingId.set(this.data.categoryId);
  }
  // Models
  editCategoryModel = this.fb.group({
    title: ['', [Validators.minLength(3)]],
    sefUrl: ['', [Validators.minLength(3)]],
    isActive: [true],
    orderBy: [0],
  });
  // Load category details
  private loadCategoryEffect = effect(() => {
    const id = this.editingId();
    if (!id) return;

    this.isLoading.set(true);

    this.contentCategoriesService.getCategoryDetails(id.toString()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          const categoryData: EditCategoryDto = res.data;
          this.editCategoryModel.patchValue({
            title: categoryData.title,
            sefUrl: categoryData.sefUrl,
            isActive: categoryData.isActive,
            orderBy: categoryData.orderBy,
          });
          console.log(this.editCategoryModel.value);
        }
      },
      error: () => this.isLoading.set(false),
    });
  });
  // Getter
  get title() {
    return this.editCategoryModel.controls.title;
  }

  get sefUrl() {
    return this.editCategoryModel.controls.sefUrl;
  }
  // Close
  close() {
    this.dialogRef.close(false);
  }
}
