import {
  Body,
  Controller,
  ParseArrayPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParametersService } from './parameters.service';
import { JwtGuard } from 'src/auth/guard';
import { ApiKeyGuard } from 'src/common/guards';
import { CreateParametersDefinitionDto } from './dto';
import { ContentParameterDefinition } from '@prisma/client';
import { ApiResponse } from 'src/common/types';

@UseGuards(JwtGuard, ApiKeyGuard)
@Controller('contents/parameters')
export class ParametersController {
  constructor(private readonly parametersService: ParametersService) {}

  @Post()
  async createCategoryParameters(
    @Body(
      new ParseArrayPipe({
        items: CreateParametersDefinitionDto,
        optional: false,
      }),
    )
    dtos: CreateParametersDefinitionDto | CreateParametersDefinitionDto[],
  ): Promise<ApiResponse<ContentParameterDefinition[]>> {
    return this.parametersService.createCategoryParameters(dtos);
  }
}
