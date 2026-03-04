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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Content Parameter Definition')
@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/parameters-definition')
export class ParametersDefinitionController {
  constructor(private readonly parametersService: ParametersDefinitionService) {}

  @ApiOperation({summary: 'Create parameter definitions, update if ID exists in body'})
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

  @ApiOperation({summary: 'Get parameter definitions by category ID'})
  @Get(':id')
  async getCategoryParametersById(
    @Param('id', ParseIntPipe) categoryId: number,
  ): Promise<ServiceResponse<ContentParameterDefinition[]>> {
    return this.parametersService.getCategoryParametersById(categoryId);
  }

  @ApiOperation({summary: 'Edit parameter definitions by category ID'})
  @Patch(':id')
  async editCategoryParametersById(
    @Param('id', ParseIntPipe) categoryId: number,
    @Body() dto: EditCategoryParametersDto,
  ): Promise<ServiceResponse<ContentParameterDefinition[]>> {
    return this.parametersService.editCategoryParametersById(categoryId, dto);
  }

  @ApiOperation({summary: 'Delete parameter definition by parameter ID'})
  @Delete(':id')
  async deleteCategoryParametersById(
    @Param('id', ParseIntPipe) parameterId: number,
  ): Promise<ServiceResponse<ContentParameterDefinition>> {
    return this.parametersService.deleteCategoryParametersById(parameterId);
  }
}
