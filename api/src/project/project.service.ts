import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto';
import slugify from 'slugify';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  // Get All Project
  getAllProject() {
    const project = this.prisma.project.findMany();
    return project;
  }
  // Get Project By ID
  async getProjectById(projectId: number) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
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
      },
    });
    if (!project) {
      throw new NotFoundException(`Project SEF ${projectSef} not found`);
    }
    return project;
  }
  // Create Project
  async createProject(dto: CreateProjectDto) {
    const baseSlug = slugify(dto.title, { lower: true, strict: true });
    let finalSlug = baseSlug;
    const similarProjects = await this.prisma.project.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
      select: {
        slug: true,
      },
    });
    // Check if similar projects exist
    if (similarProjects.length > 0) {
      // If similar projects exist, find the maximum number
      const regex = new RegExp(`^${baseSlug}(?:-(\\d+))?$`);
      const maxNumber = similarProjects.reduce((max, project) => {
        const match = project.slug.match(regex);
        if (match) {
          // If the slug matches the regex, extract the number
          const number = match[1] ? parseInt(match[1], 10) : 0;
          return number > max ? number : max;
        }
        return max;
      }, -1);
      if (maxNumber > -1) {
        finalSlug = `${baseSlug}-${maxNumber + 1}`;
      }
    }
    try {
      const project = await this.prisma.project.create({
        data: {
          ...dto,
          slug: finalSlug,
        },
      });
      return project;
    } catch (error) {
      // Çok nadir de olsa milisaniyelik çakışma olursa (Concurrency)
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Aynı anda benzer kayıt girildi, lütfen tekrar deneyin.',
        );
      }
      throw new InternalServerErrorException();
    }
  }
  // Edit Project
  async editProject() {}
  // Delete project
  async deleteProjectById(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      throw new NotFoundException(`Project ID ${projectId} not found`);
    }
    return this.prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  }
}
