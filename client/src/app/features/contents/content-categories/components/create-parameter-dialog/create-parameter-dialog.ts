import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-parameter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-parameter-dialog.html',
  styleUrl: './create-parameter-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateParameterDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateParameterDialog>);

  parameterForm = this.fb.group({
    name: ['', [Validators.required]],
    label: ['', [Validators.required]],
    type: ['TEXT', [Validators.required]],
    isRequired: [false],
    options: this.fb.array([]),
    orderBy: [0, [Validators.min(0)]],
  });

  parameterTypes = [
    { value: 'TEXT', label: 'Metin' },
    { value: 'NUMBER', label: 'Sayı' },
    { value: 'SELECT', label: 'Seçim (Select)' },
    { value: 'CHECKBOX', label: 'Onay Kutusu' },
    { value: 'DATE', label: 'Tarih' },
  ];

  get options() {
    return this.parameterForm.get('options') as FormArray;
  }

  get orderBy() {
    return this.parameterForm.controls.orderBy;
  }
  addOption() {
    this.options.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  onTypeChange() {
    const type = this.parameterForm.get('type')?.value;
    if (type !== 'SELECT') {
      this.options.clear();
    } else if (this.options.length === 0) {
      this.addOption();
    }
  }

  submit() {
    if (this.parameterForm.valid) {
      this.dialogRef.close(this.parameterForm.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
