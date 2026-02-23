import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
import { MatTabsModule } from '@angular/material/tabs';
import { ContentParametersService } from '../../../../../core/services/contents/content-parameters.service';

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
    MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit-category-dialog.html',
  styleUrl: './edit-category-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoryDialog {
  private dialogRef = inject(MatDialogRef<EditCategoryDialog>);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private contentCategoriesService = inject(ContentCategoriesService);
  private contentParametersService = inject(ContentParametersService);
  private data = inject<EditCategoryDialogInterface>(MAT_DIALOG_DATA);
  // Signals
  isLoading = signal<boolean>(false);
  editingId = signal<number | null>(null);
  categoryDetailsData = signal<any>(null);
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
          this.categoryDetailsData.set(res.data);
          console.log(this.categoryDetailsData());
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
    if (this.editingId() === null) return console.error(`${this.editingId()} id'si null olamaz!`);
    const payload: EditCategoryDto = this.editCategoryModel.value;
    this.isLoading.set(true);
    this.contentCategoriesService.editCategory(this.editingId()!, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogRef.close(true);
        this.snackBar.open('Kategori Düzenlendi', 'Tamam');
      },
      error: () => {
        this.isLoading.set(false);
        this.dialogRef.close(false);
      },
    });
  }
  deleteCategory() {
    const snackBarRef = this.snackBar.open('Silmek istiyor musunuz?', 'Tamam', {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      this.isLoading.set(true);
      if (this.editingId() === null) return console.error(`${this.editingId()} id'si null olamaz!`);
      this.contentCategoriesService.deleteCategory(this.editingId()!).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialogRef.close(true);
          this.snackBar.open('Kategori silindi', 'Tamam', {
            duration: 3000,
          });
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    });
  }
  getContentParametersDefinition() {
    this.contentParametersService.getContentsParametersDefinition(this.editingId()!).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        this.isLoading.set(false);
      },
    });
  }
  // Getter
  get title() {
    return this.editCategoryModel.controls.title;
  }

  // Close
  close() {
    this.dialogRef.close(false);
  }
}
