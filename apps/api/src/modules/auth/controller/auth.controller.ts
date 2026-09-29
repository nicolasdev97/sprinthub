import { Request, Response } from "express";

import { RegisterDto, LoginDto } from "../dto";
import { AuthService } from "../service";
import { AppError } from "../../../shared";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response) {
    const data = req.body as RegisterDto;

    const user = await this.authService.register(data);

    return res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const data = req.body as LoginDto;

    const response = await this.authService.login(data);

    res.cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { refreshToken: _, ...responseWithoutRefreshToken } = response;

    return res.status(200).json(responseWithoutRefreshToken);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 401);
    }

    const response = await this.authService.refreshAccessToken(refreshToken);

    return res.status(200).json(response);
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  }
}
