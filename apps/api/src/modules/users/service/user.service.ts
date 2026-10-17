import { AppError } from "../../../shared";

import { UserRepository } from "../repository";
import { UpdateUserDto } from "../dto";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(userId: string) {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return this.userRepository.updateUser(userId, data);
  }

  async deleteUser(userId: string, confirmationName: string) {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const fullName = `${user.firstName} ${user.lastName}`;

    if (confirmationName !== fullName) {
      throw new AppError("Confirmation name does not match", 400);
    }

    const ownedWorkspacesCount =
      await this.userRepository.countOwnedWorkspaces(userId);

    if (ownedWorkspacesCount > 0) {
      throw new AppError(
        "Cannot delete user account while owning workspaces",
        400,
      );
    }

    await this.userRepository.deleteUser(userId);
  }
}
