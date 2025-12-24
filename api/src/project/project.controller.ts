import {
  BadRequestException,
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
      storage: diskStorage({
        destination: './uploads/projects',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      // 1. ADIM: Dosya boyutu sınırı (Byte cinsinden)
      limits: {
        fileSize: 90000, // 90KB
      },
      // 2. ADIM: Dosya tipi kontrolü
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          // Hata fırlatmak yerine dosyayı reddet
          return callback(
            new BadRequestException('Sadece jpeg, jpg veya png yüklenebilir!'),
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
    if (file) {
      dto.imageUrl = `/uploads/projects/${file.filename}`;
    }
    return this.projectService.createProject(dto);
  }

  @Patch(':id')
  editProjectById(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() dto: EditProjectDto,
  ) {
    return this.projectService.editProjectById(projectId, dto);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteProjectById(@Param('id', ParseIntPipe) projectId: number) {
    return this.projectService.deleteProjectById(projectId);
  }
}
