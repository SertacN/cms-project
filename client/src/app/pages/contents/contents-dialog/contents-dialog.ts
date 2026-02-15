import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { ContentCategoriesService } from '../../../core/services/contents';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CreateCategoryDto } from '../../../core/services/contents/interfaces';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { form, FormField, maxLength, min, minLength, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-contents-dialog',
  imports: [
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogActions,
    FormField,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './contents-dialog.html',
  styleUrl: './contents-dialog.css',
})
export class ContentsDialog {
  private dialogRef = inject(MatDialogRef<ContentsDialog>);
  private contentCategoriesService = inject(ContentCategoriesService);
  isLoading = signal(false);

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

  close() {
    this.dialogRef.close(false);
  }
}
