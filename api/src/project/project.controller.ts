import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from './guard';
import { JwtGuard } from 'src/auth/guard';
import { CreateProjectDto, EditProjectDto } from './dto';
import { ProjectService } from './project.service';

@Controller('project')
@UseGuards(ApiKeyGuard)
@UseGuards(JwtGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}
  @Get()
  getAllProject() {
    return this.projectService.getAllProject();
  }

  @Get(':id')
  getProjectById(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectById(projectId);
  }

  @Post()
  createProject(@Body() dto: CreateProjectDto) {
    return 'create project';
  }

  @Patch(':id')
  editProject(
    @Param('id', ParseIntPipe) projectId: Number,
    @Body() dto: EditProjectDto,
  ) {
    return 'edit project';
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteProjectById(@Param('id', ParseIntPipe) projectId: number) {
    return 'delete project';
  }
}
