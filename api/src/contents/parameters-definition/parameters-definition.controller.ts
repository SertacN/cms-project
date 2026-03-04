import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParametersDefinitionService } from './parameters-definition.service';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';
import { CreateParametersDefinitionDto, EditCategoryParametersDto } from './dto';
import { ContentParameterDefinition } from '@prisma/client';
import { ServiceResponse } from 'src/common/types';

@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/parameters-definition')
export class ParametersDefinitionController {
  constructor(private readonly parametersService: ParametersDefinitionService) {}

  @Post()
  async createCategoryParameters(
    @Body(
      new ParseArrayPipe({
        items: CreateParametersDefinitionDto,
        optional: false,
      }),
    )
    dtos: CreateParametersDefinitionDto | CreateParametersDefinitionDto[],
  ): Promise<ServiceResponse<ContentParameterDefinition[]>> {
    return this.parametersService.createCategoryParameters(dtos);
  }

  @Get(':id')
  async getCategoryParametersById(
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<ServiceResponse<ContentParameterDefinition[]>> {
    return this.parametersService.getCategoryParametersById(categoryId);
  }

  @Patch(':id')
  async editCategoryParametersById(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() dto: EditCategoryParametersDto,
  ): Promise<ServiceResponse<ContentParameterDefinition[]>> {
    return this.parametersService.editCategoryParametersById(categoryId, dto);
  }

  @Delete(':id')
  async deleteCategoryParametersById(
    @Param('id', ParseIntPipe) parameterId: number,
  ): Promise<ServiceResponse<ContentParameterDefinition>> {
    return this.parametersService.deleteCategoryParametersById(parameterId);
  }
}
