import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ContentCategoriesService } from '../../../core/services/contents';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SharedModule } from '../../../shared/shared-module';
import { form, FormField, maxLength, min, minLength, required } from '@angular/forms/signals';
import { switchMap } from 'rxjs';
import { CreateCategoryDto, EditCategoryDto } from '../../../core/services/contents/interfaces';

@Component({
  selector: 'app-content-categories',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SharedModule, FormField],
  templateUrl: './content-categories.html',
  styleUrl: './content-categories.css',
})
export class ContentCategories {
  private readonly contentCategoriesService = inject(ContentCategoriesService);
  // Signals
  private refreshTrigger = signal(0);
  isLoading = signal<boolean>(false);
  categories = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.contentCategoriesService.getAllCategories()),
    ),
  );
  @ViewChild('categoryDetailDialog') categoryDetailDialog!: ElementRef<HTMLDialogElement>;

  // Validation
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

  editCategoryModel = signal<EditCategoryDto>({
    title: '',
    orderBy: 0,
    isActive: true,
    sefUrl: '',
  });

  // Methods
  createCategory(e: Event) {
    e.preventDefault();
    this.isLoading.set(true);
    const payload = this.createCategoryModel();
    this.contentCategoriesService.createCategory(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.closeCreateCategoryDialog();
        this.refreshTrigger.update((value) => value + 1);
        this.resetCategoryCreateForm();
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
  editCategory(id: number, e: Event, isActive?: boolean) {
    e.preventDefault();
    this.isLoading.set(true);
    const payload = this.editCategoryModel();
    if (isActive != null || isActive != undefined) {
      this.contentCategoriesService.editCategory(id, { isActive: isActive }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.refreshTrigger.update((value) => value + 1);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      this.contentCategoriesService.editCategory(id, payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.refreshTrigger.update((value) => value + 1);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    }
  }

  openCreateCategoryDialog() {
    this.categoryDetailDialog.nativeElement.showModal();
  }

  closeCreateCategoryDialog() {
    this.categoryDetailDialog.nativeElement.close();
    this.resetCategoryCreateForm();
  }
  toggleActive(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.createCategoryModel.update((current) => ({ ...current, isActive: checked }));
  }
  resetCategoryCreateForm() {
    this.createCategoryModel.set({
      title: '',
      orderBy: 0,
      isActive: true,
    });
  }
}
