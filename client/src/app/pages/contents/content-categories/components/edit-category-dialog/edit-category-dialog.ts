import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { ContentCategoriesService } from '../../../../../core/services/contents';
import { EditCategoryDialogInterface } from '../../interfaces';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import {
  CategoryDetailsDialog,
  EditCategoryDto,
} from '../../../../../core/services/contents/interfaces/categories';

@Component({
  selector: 'app-edit-category-dialog',
  imports: [
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
  ],
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
  categoryTitle = signal<string>('');
  // Init
  ngOnInit() {
    this.editingId.set(this.data.categoryId);
  }
  // Models
  editCategoryModel = this.fb.nonNullable.group({
    title: ['', [Validators.minLength(3)]],
    sefUrl: [''],
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
        if (res.success && res.data) {
          const categoryData: CategoryDetailsDialog = res.data as CategoryDetailsDialog;
          this.editCategoryModel.patchValue({
            title: categoryData.title,
            sefUrl: categoryData.sefUrl,
            isActive: categoryData.isActive,
            orderBy: categoryData.orderBy,
          });
        }
      },
      error: () => this.isLoading.set(false),
    });
  });
  editCategory() {
    if (this.editCategoryModel.invalid) {
      this.editCategoryModel.markAllAsTouched();
      return;
    }
    const payload: EditCategoryDto = this.editCategoryModel.value;
    this.isLoading.set(true);
    console.log(payload);
    this.contentCategoriesService.editCategory(this.editingId()!, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading.set(false);
        this.dialogRef.close(false);
      },
    });
  }
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
