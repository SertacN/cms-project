import { FormGroup } from '@angular/forms';

export function getDirtyValues<T>(form: FormGroup): Partial<T> {
  const dirtyValues: any = {};
  Object.keys(form.controls).forEach((key) => {
    const control = form.get(key);
    if (control?.dirty) {
      dirtyValues[key] = control.value;
    }
  });
  return dirtyValues;
}
