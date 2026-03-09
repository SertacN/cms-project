import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LucideAngularModule } from 'lucide-angular';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EditParameterDialogInterface } from '../../interfaces';

@Component({
  selector: 'app-edit-parameter-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    LucideAngularModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-parameter-dialog.html',
  styleUrl: './edit-parameter-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditParameterDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditParameterDialog>);
  private data = inject<EditParameterDialogInterface>(MAT_DIALOG_DATA);
  editingId = signal<number | null>(null);
  editParameterForm = this.fb.group({
    name: ['', [Validators.required]],
    label: ['', [Validators.required]],
    type: ['TEXT', [Validators.required]],
    isRequired: [false],
    options: this.fb.array([]),
    orderBy: [0, [Validators.min(0)]],
  });
  ngOnInit() {
    this.editingId.set(this.data.parameterId);
    this.editParameterForm.patchValue({
      name: this.data.name,
      label: this.data.label,
      type: this.data.type,
      isRequired: this.data.isRequired ?? false,
      orderBy: this.data.orderBy ?? 0,
    });
    if (this.data.type === 'SELECT' && this.data.options?.length) {
      this.options.clear();
      this.data.options.forEach((opt) => {
        this.options.push(this.fb.control(opt, Validators.required));
      });
    }
  }
  parameterTypes = [
    { value: 'TEXT', label: 'Metin' },
    { value: 'NUMBER', label: 'Sayı' },
    { value: 'SELECT', label: 'Seçim (Select)' },
    { value: 'CHECKBOX', label: 'Onay Kutusu' },
    { value: 'DATE', label: 'Tarih' },
  ];

  get options() {
    return this.editParameterForm.get('options') as FormArray;
  }

  get orderBy() {
    return this.editParameterForm.controls.orderBy;
  }

  addOption() {
    this.options.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  onTypeChange() {
    const type = this.editParameterForm.get('type')?.value;
    if (type !== 'SELECT') {
      this.options.clear();
    } else if (this.options.length === 0) {
      this.addOption();
    }
  }

  submit() {
    if (this.editParameterForm.valid) {
      this.dialogRef.close(this.editParameterForm.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
