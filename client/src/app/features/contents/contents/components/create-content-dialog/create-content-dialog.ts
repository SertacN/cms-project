import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
import { ContentsService } from '../../../../../core/services/contents/contents.service';
import { ContentCategoriesService } from '../../../../../core/services/contents/contents-categories.service';
import { ParameterDefinition } from '../../../../../core/services/contents/interfaces/categories/category-details.dto';
import { ToastService } from '../../../../../core/services/toast';

@Component({
  selector: 'app-create-content-dialog',
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
  templateUrl: './create-content-dialog.html',
  styleUrl: './create-content-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateContentDialog {
  private readonly dialogRef = inject(MatDialogRef<CreateContentDialog>);
  private readonly data = inject<{ categoryId: number }>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly contentsService = inject(ContentsService);
  private readonly categoriesService = inject(ContentCategoriesService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly parameters = signal<ParameterDefinition[]>([]);
  readonly paramValues = signal<Record<number, string>>({});

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    content: [''],
    summary: [''],
  });

  constructor() {
    if (this.data.categoryId) {
      this.loadParameters(this.data.categoryId);
    }
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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { title, content, summary } = this.form.getRawValue();
    this.isLoading.set(true);

    this.contentsService.createPost({ title, content, summary, categoryId: this.data.categoryId }).subscribe({
      next: (res) => {
        if (res.data) {
          this.saveParams(res.data.id);
          this.toast.success('İçerik oluşturuldu');
        }
        this.isLoading.set(false);
        this.dialogRef.close(true);
      },
      error: () => this.isLoading.set(false),
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
