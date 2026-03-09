import { ParameterType } from './create-parameter-definition.dto';

export interface ParameterDefinition {
  id: number;
  name: string;
  label: string;
  type: ParameterType;
  options: string[];
  isRequired: boolean;
  orderBy: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDetailsDialog {
  id: number;
  title: string;
  sefUrl: string;
  orderBy: number;
  isActive: boolean;
  parameterDefinitions: ParameterDefinition[];
  createdAt: string;
  updatedAt: string;
}
