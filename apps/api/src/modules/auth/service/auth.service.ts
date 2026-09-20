import { AppError } from "../../../shared/errors";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../../../shared/utils";

import { RegisterDto, LoginDto } from "../dto";
import { AuthRepository } from "../repository";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(data: RegisterDto) {
    const existingUser = await this.authRepository.getUserByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await this.authRepository.createUser({
      ...data,
      passwordHash,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async login(data: LoginDto) {
    const user = await this.authRepository.getUserByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await comparePassword(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({
      userId: user.id,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken: token,
      user: userWithoutPassword,
    };
  }
}
