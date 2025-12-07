import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  getAllProject() {
    const project = this.prisma.project.findMany();
    return project;
  }
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
  async createProject() {}
  async editProject() {}
  async deleteProject() {}
}
