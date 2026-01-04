import { Module } from '@nestjs/common';
import { ParametersDefinitionService } from './parameters-definition.service';
import { ParametersDefinitionController } from './parameters-definition.controller';

@Module({
  providers: [ParametersDefinitionService],
  controllers: [ParametersDefinitionController],
  exports: [ParametersDefinitionService],
})
export class ParametersDefinitionModule {}
