import {
  AppError,
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../../../shared";

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

    const accessToken = generateToken({
      userId: user.id,
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    await this.authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const storedRefreshToken =
      await this.authRepository.getRefreshTokenByHash(refreshTokenHash);

    if (!storedRefreshToken) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    if (storedRefreshToken.expiresAt <= new Date()) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const accessToken = generateToken({
      userId: storedRefreshToken.userId,
    });

    return {
      accessToken,
    };
  }
}
