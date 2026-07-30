import { AppError } from "../../../shared/errors";

import { RegisterDto } from "../dto";
import { AuthRepository } from "../repository";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(data: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    return this.authRepository.createUser(data);
  }
}
