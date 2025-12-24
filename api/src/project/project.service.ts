import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto, EditProjectDto } from './dto';
import { generateUniqueSlug, saveFileToDisk } from './utils';
import path from 'path';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  // Get All Project
  getAllProject() {
    const project = this.prisma.project.findMany({
      where: {
        isDeleted: false,
      },
    });
    return project;
  }
  // Get Project By ID
  async getProjectById(projectId: number) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        isDeleted: false,
      },
    });
    if (!project) {
      throw new NotFoundException(`Project ID ${projectId} not found`);
    }
    return project;
  }
  // Get Project By SEF
  async getProjectBySef(projectSef: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        slug: projectSef,
        isDeleted: false,
      },
    });
    if (!project) {
      throw new NotFoundException(`Project SEF ${projectSef} not found`);
    }
    return project;
  }
  // Create Project
  async createProject(dto: CreateProjectDto, file?: Express.Multer.File) {
    // 1. Create SefUrl
    const finalSlug = await generateUniqueSlug(dto.title, this.prisma.project);
    // 2. Create File Name
    let fileName: string | null = null;
    if (file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      fileName = `${uniqueSuffix}${path.extname(file.originalname)}`;
    }
    try {
      // 3. Create Database Record
      const project = await this.prisma.project.create({
        data: {
          ...dto,
          slug: finalSlug,
          imageUrl: fileName ? `/uploads/projects/${fileName}` : null,
        },
      });

      // 4. If file and fileName is not null, save file to disk
      if (file && fileName) {
        saveFileToDisk(file.buffer, fileName, 'uploads/projects');
      }
      return {
        success: true,
        message: 'Project created successfully',
        data: project,
      };
    } catch (error) {
      throw new InternalServerErrorException('Project could not be created');
    }
  }
  // Edit Project
  async editProjectById(projectId: number, dto: EditProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
        isDeleted: false,
      },
    });
    if (!project) {
      throw new NotFoundException(`Project ID ${projectId} not found`);
    }
    const updatedProject = await this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        ...dto,
      },
    });
    return {
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    };
  }
  // Delete project
  async deleteProjectById(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
        isDeleted: false,
      },
    });
    if (!project) {
      throw new NotFoundException(`Project ID ${projectId} not found`);
    }
    await this.prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return {
      success: true,
      message: 'Project deleted successfully',
    };
  }
}
