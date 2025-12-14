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

  @Get('id/:id')
  getProjectById(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.getProjectById(projectId);
  }

  @Get(':sef')
  getProjectBySef(@Param('sef') projectSef: string) {
    return this.projectService.getProjectBySef(projectSef);
  }

  @Post()
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectService.createProject(dto);
  }

  @Patch(':id')
  editProjectById(
    @Param('id', ParseIntPipe) projectId: Number,
    @Body() dto: EditProjectDto,
  ) {
    return `Edit project ${projectId}`;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteProjectById(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.deleteProjectById(projectId);
  }
}
