export interface EditParameterDialogInterface {
  parameterId: number;
  name: string;
  label: string;
  type: string;
  options?: string[];
  isRequired?: boolean;
  orderBy?: number;
}
