import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto, EditProjectDto } from './dto';
import { generateUniqueUrl, saveFileToDisk } from '../common/utils';
import path from 'path';
import { PaginationDto } from 'src/common/dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  // Get All Project
  async getAllProject(paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        skip,
        take: limit,
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          slug: true,
          tech: true,
          version: true,
          imageUrl: true,
          techLogoImageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.project.count({
        where: { isDeleted: false }, // Filter count
      }),
    ]);
    return {
      success: true,
      message: 'Projects fetched successfully',
      data: projects,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
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
    const { isDeleted, deletedAt, ...projectData } = project;
    return projectData;
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
    const { isDeleted, deletedAt, ...projectData } = project;
    return projectData;
  }
  // Create Project
  async createProject(dto: CreateProjectDto, file?: Express.Multer.File) {
    // 1. Create SefUrl
    const finalSlug = await generateUniqueUrl(dto.title, this.prisma.project);
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
      const { isDeleted, deletedAt, ...projectData } = project;
      return {
        success: true,
        message: 'Project created successfully',
        data: projectData,
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
    const { isDeleted, deletedAt, ...projectData } = updatedProject;
    return {
      success: true,
      message: 'Project updated successfully',
      data: { projectData },
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
