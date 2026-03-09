import { ParameterType } from './create-parameter-definition.dto';

export interface EditParameterDefiniton {
  id?: number;

  name: string;

  label: string;

  type: ParameterType;

  options?: string[];

  isRequired?: boolean;

  orderBy?: number;

  categoryId: number;
}

export interface EditParameterDefinitonDto {
  parameters: EditParameterDefiniton[];
}
