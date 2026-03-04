import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { ParametersValueService } from './parameters-value.service';
import { CreateParameterValuesDto, DeleteParameterValueDto } from './dto';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Content Parameter Value')
@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/parameters-value')
export class ParametersValueController {
  constructor(private readonly parametersValueService: ParametersValueService) {}

  @ApiOperation({summary: 'Create or update parameter values'})
  @Post()
  async createOrUpdateValues(@Body() dto: CreateParameterValuesDto) {
    return this.parametersValueService.createOrUpdateValues(dto);
  }

  @ApiOperation({summary: 'Delete parameter value'})
  @Delete()
  async deleteParamValue(@Body() dto: DeleteParameterValueDto) {
    return this.parametersValueService.deleteParamValue(dto);
  }
}
