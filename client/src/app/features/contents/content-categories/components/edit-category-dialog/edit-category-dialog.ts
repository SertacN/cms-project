import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import {
  ContentCategoriesService,
  ContentParametersService,
} from '../../../../../core/services/contents';
import {
  CategoryDetailsDialog,
  CreateParametersDefinitionDto,
  EditCategoryDto,
  EditParameterDefinitonDto,
} from '../../../../../core/services/contents/interfaces/categories';
import { ConfirmDialog } from '../../../../../shared/components';
import { EditCategoryDialogInterface } from '../../interfaces';
import { CreateParameterDialog } from '../create-parameter-dialog/create-parameter-dialog';
import { EditParameterDialog } from '../edit-parameter-dialog/edit-parameter-dialog';

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
  private dialog = inject(MatDialog);
  private data = inject<EditCategoryDialogInterface>(MAT_DIALOG_DATA);
  // Signals
  isLoading = signal<boolean>(false);
  editingId = signal<number | null>(null);
  categoryDetailsData = signal<CategoryDetailsDialog | null>(null);
  // Init
  ngOnInit() {
    this.editingId.set(this.data.categoryId);
  }
  // Models
  editCategoryModel = this.fb.nonNullable.group({
    title: ['', [Validators.minLength(3), Validators.maxLength(50)]],
    sefUrl: [''],
    isActive: [true],
    orderBy: [0],
  });
  // Load category details
  private loadCategoryEffect = effect(() => {
    const id = this.editingId();
    if (!id) {
      this.snackBar.open(`${this.editingId()} ID Bulunamadı`, 'Tamam', {
        duration: 5000,
      });
      this.dialogRef.close(false);
      return;
    }
    this.isLoading.set(true);

    this.contentCategoriesService.getCategoryDetails(id.toString()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.categoryDetailsData.set(res.data);
          this.editCategoryModel.patchValue({
            title: res.data.title,
            sefUrl: res.data.sefUrl,
            isActive: res.data.isActive,
            orderBy: res.data.orderBy,
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
        this.snackBar.open('Kategori Düzenlendi', 'Tamam', {
          duration: 5000,
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.dialogRef.close(false);
      },
    });
  }
  deleteCategory() {
    const confirmRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Kategoriyi Sil',
        message: `"${this.categoryDetailsData()?.title ?? ''}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
        confirmText: 'Evet, Sil',
        cancelText: 'İptal',
        danger: true,
      },
    });

    confirmRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      if (this.editingId() === null) return console.error(`${this.editingId()} id'si null olamaz!`);
      this.isLoading.set(true);
      this.contentCategoriesService.deleteCategory(this.editingId()!).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.dialogRef.close(true);
          this.snackBar.open('Kategori silindi', 'Tamam', { duration: 3000 });
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
        if (res.success && res.data) {
          this.categoryDetailsData.update((prev: any) => ({
            ...prev,
            parameterDefinitions: res.data,
          }));
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openEditParameterDialog(param: any) {
    const categoryId = this.editingId();
    const dialogRef = this.dialog.open(EditParameterDialog, {
      width: '500px',
      data: {
        parameterId: param.id,
        name: param.name,
        label: param.label,
        type: param.type,
        options: param.options ?? [],
        isRequired: param.isRequired ?? false,
        orderBy: param.orderBy ?? 0,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payload: EditParameterDefinitonDto = {
          parameters: [
            {
              id: param.id,
              ...result,
              categoryId: categoryId!,
            },
          ],
        };
        this.isLoading.set(true);
        this.contentParametersService.editContentsParameterDefinition(categoryId!, payload).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success) {
              this.snackBar.open('Parametre başarıyla güncellendi', 'Tamam', {
                duration: 3000,
              });
              this.getContentParametersDefinition();
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Parametre düzenlenirken bir hata oluştu', 'Tamam', {
              duration: 5000,
            });
          },
        });
      }
    });
  }

  openCreateParameterDialog() {
    const dialogRef = this.dialog.open(CreateParameterDialog, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payload: CreateParametersDefinitionDto[] = [
          {
            ...result,
            categoryId: this.editingId()!,
          },
        ];

        this.isLoading.set(true);
        this.contentParametersService.createContentsParametersDefinition(payload).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (res.success) {
              this.snackBar.open('Parametre başarıyla eklendi', 'Tamam', {
                duration: 3000,
              });
              this.getContentParametersDefinition();
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Parametre eklenirken bir hata oluştu', 'Tamam', {
              duration: 5000,
            });
          },
        });
      }
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
