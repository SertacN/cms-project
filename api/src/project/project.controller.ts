import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiKeyGuard } from './guard';
import { JwtGuard } from 'src/auth/guard';
import { CreateProjectDto, EditProjectDto } from './dto';
import { ProjectService } from './project.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
  @UseInterceptors(
    FileInterceptor('image', {
      // Limits and Filter
      limits: { fileSize: 90000 }, // 9mb
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Sadece resim dosyaları!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  createProject(
    @Body() dto: CreateProjectDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.projectService.createProject(dto, file);
  }

  @Patch(':id')
  editProjectById(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: EditProjectDto,
  ) {
    return this.projectService.editProjectById(projectId, dto);
  }
  @Delete(':id')
  deleteProjectById(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.deleteProjectById(projectId);
  }
}
