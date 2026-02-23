import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ContentCategoriesService } from '../../../../../core/services/contents';
import { CreateCategoryDto } from '../../../../../core/services/contents/interfaces/categories';
@Component({
  selector: 'app-create-category-dialog',
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
    MatDialogTitle,
  ],
  templateUrl: './create-category-dialog.html',
  styleUrl: './create-category-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCategoryDialog {
  private dialogRef = inject(MatDialogRef<CreateCategoryDialog>);
  private fb = inject(FormBuilder);
  private contentCategoriesService = inject(ContentCategoriesService);
  // Signals
  isLoading = signal(false);
  // Models
  createCategoryModel = this.fb.nonNullable.group({
    title: ['', [Validators.minLength(3), Validators.required]],
    orderBy: [0, [Validators.min(0)]],
    isActive: [true],
  });
  createCategory() {
    if (this.createCategoryModel.invalid) {
      this.createCategoryModel.markAllAsTouched();
      return;
    }
    const payload: CreateCategoryDto = this.createCategoryModel.getRawValue();
    this.isLoading.set(true);
    this.contentCategoriesService.createCategory(payload).subscribe({
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
  deneme() {
    return 'deneme';
  }
  // Getter
  get title() {
    return this.createCategoryModel.controls.title;
  }

  get orderBy() {
    return this.createCategoryModel.controls.orderBy;
  }
  // Close
  close() {
    this.dialogRef.close(false);
  }
}
