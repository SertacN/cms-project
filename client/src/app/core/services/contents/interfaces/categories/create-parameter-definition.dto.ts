export type ParameterType = 'TEXT' | 'NUMBER' | 'SELECT' | 'CHECKBOX' | 'DATE' | 'TEXTAREA';

export interface CreateParametersDefinitionDto {
  name: string;

  label: string;

  type: ParameterType;

  options?: string[];

  isRequired?: boolean;

  orderBy?: number;

  categoryId: number;
}
