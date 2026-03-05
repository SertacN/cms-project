export interface ParameterType {
  TEXT: 'TEXT';
  NUMBER: 'NUMBER';
  SELECT: 'SELECT';
  CHECKBOX: 'CHECKBOX';
  DATE: 'DATE';
  TEXTAREA: 'TEXTAREA';
}
export interface CreateParametersDefinitionDto {
  name: string;

  label: string;

  type: ParameterType;

  options?: string[];

  isRequired?: boolean;

  orderBy?: number;

  categoryId: number;
}
