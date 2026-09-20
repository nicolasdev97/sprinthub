import { AppError } from "../../../shared/errors";

import { UserRepository } from "../repository";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(userId: string) {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }
}
