import { AppError } from "../../../shared/errors";

import { UserRepository } from "../repository";
import { UpdateUserDto } from "../dto";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(userId: string) {
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
}
