import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { LucideAngularModule } from 'lucide-angular';
import { ContentCategoriesService } from '../../../../../core/services/contents/contents-categories.service';
import { ContentsService } from '../../../../../core/services/contents/contents.service';
import { ParameterDefinition } from '../../../../../core/services/contents/interfaces/categories/category-details.dto';
import { ToastService } from '../../../../../core/services/toast';

@Component({
  selector: 'app-edit-content-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    LucideAngularModule,
  ],
  templateUrl: './edit-content-dialog.html',
  styleUrl: './edit-content-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditContentDialog {
  private readonly dialogRef = inject(MatDialogRef<EditContentDialog>);
  private readonly data = inject<{ contentId: number }>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly contentsService = inject(ContentsService);
  private readonly categoriesService = inject(ContentCategoriesService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly parameters = signal<ParameterDefinition[]>([]);
  readonly paramValues = signal<Record<number, string>>({});
  readonly categoryId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    content: [''],
    summary: [''],
  });

  constructor() {
    this.loadPost();
  }

  private loadPost(): void {
    this.contentsService.getPostById(this.data.contentId).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (!res.data) return;
        const p = res.data;
        this.categoryId.set(p.categoryId);
        this.form.patchValue({
          title: p.title,
          content: p.content ?? '',
          summary: p.summary ?? '',
        });
        // Parametre değerlerini yükle
        const vals: Record<number, string> = {};
        p.parameters?.forEach((pv) => {
          vals[pv.definitionId] = pv.value;
        });
        this.paramValues.set(vals);
        // Parametre tanımlarını yükle
        this.loadParameters(p.categoryId);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private loadParameters(categoryId: number): void {
    this.categoriesService.getCategoryDetails(String(categoryId)).subscribe({
      next: (res) => {
        if (res.data) {
          this.parameters.set(res.data.resolvedParameters ?? res.data.parameterDefinitions ?? []);
        }
      },
    });
  }

  setParamValue(definitionId: number, value: string): void {
    this.paramValues.update((prev) => ({ ...prev, [definitionId]: value }));
  }

  getParamValue(definitionId: number): string {
    return this.paramValues()[definitionId] ?? '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, content, summary } = this.form.getRawValue();
    const categoryId = this.categoryId();
    if (categoryId === null) return;
    this.isSaving.set(true);
    this.contentsService
      .updatePost(this.data.contentId, { categoryId, title, content, summary })
      .subscribe({
        next: () => {
          this.saveParams(this.data.contentId);
          this.toast.success('İçerik kaydedildi');
          this.isSaving.set(false);
          this.dialogRef.close(true);
        },
        error: () => this.isSaving.set(false),
      });
  }

  private saveParams(contentId: number): void {
    const values = Object.entries(this.paramValues())
      .filter(([, v]) => v !== '')
      .map(([defId, value]) => ({ definitionId: Number(defId), value }));
    if (!values.length) return;
    this.contentsService.saveParameterValues({ contentId, values }).subscribe();
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
