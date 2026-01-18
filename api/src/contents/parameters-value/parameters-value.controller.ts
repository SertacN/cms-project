import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ParametersValueService } from './parameters-value.service';
import { CreateParameterValuesDto, DeleteParameterValueDto } from './dto';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';

@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/parameters-value')
export class ParametersValueController {
  constructor(private readonly parametersValueService: ParametersValueService) {}

  @Post()
  async createOrUpdateValues(@Body() dto: CreateParameterValuesDto) {
    return this.parametersValueService.createOrUpdateValues(dto);
  }

  @Delete()
  async deleteParamValue(@Body() dto: DeleteParameterValueDto) {
    return this.parametersValueService.deleteParamValue(dto);
  }
}
