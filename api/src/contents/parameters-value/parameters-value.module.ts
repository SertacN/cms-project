import { Module } from '@nestjs/common';
import { ParametersValueService } from './parameters-value.service';
import { ParametersValueController } from './parameters-value.controller';

@Module({
  providers: [ParametersValueService],
  controllers: [ParametersValueController],
  exports: [ParametersValueService],
})
export class ParametersValueModule {}
