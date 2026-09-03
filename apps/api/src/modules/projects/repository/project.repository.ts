import { prisma } from "../../../database/prisma";
import { CreateProjectDto, UpdateProjectDto } from "../dto";

export class ProjectRepository {
  async findMany(workspaceId: string) {
    return prisma.project.findMany({
      where: {
        workspaceId,
      },
    });
  }

  async findById(id: string) {
    return prisma.project.findUnique({
      where: {
        id,
      },
    });
  }

  async create(data: CreateProjectDto) {
    return prisma.project.create({
      data,
    });
  }

  async update(id: string, data: UpdateProjectDto) {
    return prisma.project.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
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
