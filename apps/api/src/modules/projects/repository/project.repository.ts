import { prisma } from "../../../database/prisma";
import { CreateProjectDto, UpdateProjectDto } from "../dto";
import { ProjectFilterParams } from "../types";

export class ProjectRepository {
  async createProject(data: CreateProjectDto) {
    return prisma.project.create({
      data,
    });
  }

  async getProjects(workspaceId: string, filters?: ProjectFilterParams) {
    console.log("FILTERS IN REPOSITORY:", filters);

    return prisma.project.findMany({
      where: {
        workspaceId,
        status: filters?.status,
        archived: filters?.archived,
        ...(filters?.search && {
          name: {
            contains: filters.search,
            mode: "insensitive",
          },
        }),
      },
      orderBy: filters?.sortBy
        ? {
            [filters.sortBy]: filters.sortOrder ?? "asc",
          }
        : undefined,
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

  async unarchiveProject(projectId: string) {
    return prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        archived: false,
      },
    });
  }
}
