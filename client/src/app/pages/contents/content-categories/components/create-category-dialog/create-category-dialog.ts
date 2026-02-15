import { Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, min, minLength, required } from '@angular/forms/signals';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ContentCategoriesService } from '../../../../../core/services/contents';
import { CreateCategoryDto } from '../../../../../core/services/contents/interfaces';

@Component({
  selector: 'app-create-category-dialog',
  imports: [
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    MatDialogActions,
    FormField,
    MatCheckboxModule,
  ],
  templateUrl: './create-category-dialog.html',
  styleUrl: './create-category-dialog.css',
})
export class CreateCategoryDialog {
  private dialogRef = inject(MatDialogRef<CreateCategoryDialog>);
  private contentCategoriesService = inject(ContentCategoriesService);

  createCategoryModel = signal<CreateCategoryDto>({
    title: '',
    orderBy: 0,
    isActive: true,
  });
  createCategoryForm = form(this.createCategoryModel, (schemaPath) => {
    required(schemaPath.title, { message: 'Kategori Adı Zorunludur' });
    min(schemaPath.orderBy, 0, { message: 'Sıralama 0 dan büyük olmalıdır' });
    minLength(schemaPath.title, 3, { message: 'Kategori Adı en az 3 karakter olmalıdır' });
    maxLength(schemaPath.title, 50, { message: 'Kategori Adı en fazla 50 karakter olmalıdır' });
  });
  createCategory() {
    const payload = this.createCategoryModel();
    console.log(payload);
    /*
    this.isLoading.set(true);

    this.contentCategoriesService.createCategory(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true); // true => başarı
      },
      error: () => {
        this.isLoading.set(false);
      },
    });*/
  }

  isLoading = signal(false);
  close() {
    this.dialogRef.close(false);
  }
}
