import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ContentCategoriesService } from '../../../core/services/contents';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SharedModule } from '../../../shared/shared-module';
import {
  form,
  FormField,
  maxLength,
  min,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';
import { switchMap } from 'rxjs';
import { CreateCategoryDto, EditCategoryDto } from '../../../core/services/contents/interfaces';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CreateCategoryDialog } from './components/create-category-dialog/create-category-dialog';
@Component({
  selector: 'app-content-categories',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    SharedModule,
    FormField,
    ReactiveFormsModule,
  ],
  templateUrl: './content-categories.html',
  styleUrl: './content-categories.css',
})
export class ContentCategories {
  private readonly contentCategoriesService = inject(ContentCategoriesService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  // Signals
  refreshTrigger = signal(0);
  isLoading = signal<boolean>(false);
  categories = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.contentCategoriesService.getAllCategories()),
    ),
  );
  editingId = signal<number | null>(null);
  @ViewChild('createCategoryDialog') createCategoryDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('editDialog') editDialog!: ElementRef<HTMLDialogElement>;

  // Validation & Methods Create Category
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

  createCategory(e: Event) {
    e.preventDefault();
    const payload = this.createCategoryModel();
    console.log(payload);

    submit(this.createCategoryForm, async () => {
      this.isLoading.set(true);
      this.contentCategoriesService.createCategory(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.closeCreateCategoryDialog(this.createCategoryDialog.nativeElement);
          this.refreshTrigger.update((value) => value + 1);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    });
  }

  // Edit Category
  editForm = this.fb.group({
    categoryId: [0],
    title: ['', [Validators.minLength(3)]],
    sefUrl: ['', [Validators.minLength(3)]],
    isActive: [true],
    orderBy: [0],
  });
  editCategory(categoryId: number) {
    this.isLoading.set(true);
    this.editingId.set(categoryId);

    this.contentCategoriesService.getCategoryDetails(categoryId.toString()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          const categoryData: EditCategoryDto = res.data;
          this.editForm.patchValue({
            categoryId: categoryId,
            title: categoryData.title,
            sefUrl: categoryData.sefUrl,
            isActive: categoryData.isActive,
            orderBy: categoryData.orderBy,
          });
          console.log(this.editForm.value);
          this.editDialog.nativeElement.showModal();
        }
      },
    });
  }
  editCategoryActivated(id: number, e: Event, isActive?: boolean) {
    e.preventDefault();
    this.isLoading.set(true);
    this.contentCategoriesService.editCategory(id, { isActive: isActive }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.refreshTrigger.update((value) => value + 1);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openCreateCategoryDialog2(dialog: HTMLDialogElement) {
    dialog.showModal();
  }

  closeCreateCategoryDialog(dialog: HTMLDialogElement) {
    dialog.close();
  }

  resetCategoryCreateForm() {
    this.createCategoryModel.set({
      title: '',
      orderBy: 0,
      isActive: true,
    });
  }
  openCreateCategoryDialog() {
    const dialogRef = this.dialog.open(CreateCategoryDialog, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshTrigger.update((v) => v + 1);
      }
    });
  }
}
