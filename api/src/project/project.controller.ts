import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from './guard';

@Controller('project')
@UseGuards(ApiKeyGuard)
export class ProjectController {
  @Get()
  getProject() {
    return 'all project';
  }

  @Get(':id')
  getProjectById(@Param('id', ParseIntPipe) projectId: Number) {
    return 'get projecy by id' + projectId;
  }
}
