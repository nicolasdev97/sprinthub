import { prisma } from "../../../database/prisma";
import { CreateProjectDto, UpdateProjectDto } from "../dto";

export class ProjectRepository {
  async createProject(data: CreateProjectDto) {
    return prisma.project.create({
      data,
    });
  }

  async getProjects(workspaceId: string) {
    return prisma.project.findMany({
      where: {
        workspaceId,
      },
    });
  }

  async getProjectById(id: string) {
    return prisma.project.findUnique({
      where: {
        id,
      },
    });
  }

  async getProjectByName(workspaceId: string, name: string) {
    return prisma.project.findFirst({
      where: {
        workspaceId,
        name,
      },
    });
  }

  async updateProject(id: string, data: UpdateProjectDto) {
    return prisma.project.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteProject(id: string) {
    return prisma.project.delete({
      where: {
        id,
      },
    });
  }

  async archiveProject(projectId: string) {
    return prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        archived: true,
      },
    });
  }
}
