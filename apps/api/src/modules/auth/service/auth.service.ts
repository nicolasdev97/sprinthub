import { AppError } from "../../../shared/errors";
import { generateToken } from "../../../shared/utils";

import { RegisterDto, LoginDto } from "../dto";
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

  async login(data: LoginDto) {
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.passwordHash !== data.password) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({
      userId: user.id,
    });

    return {
      accessToken: token,
      user,
    };
  }
}
