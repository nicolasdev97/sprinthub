import { Request, Response } from 'express';

import { RegisterDto, LoginDto } from '../dto';
import { AuthService } from '../service';
import { AppError } from '../../../shared';

export const SESSION_COOKIE_NAME = 'sprinthub_session';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private clearAuthCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
  }

  async register(req: Request, res: Response) {
    const data = req.body as RegisterDto;

    const user = await this.authService.register(data);

    return res.status(201).json(user);
  }

  async login(req: Request, res: Response) {
    const data = req.body as LoginDto;

    const response = await this.authService.login(data);
    const isProduction = process.env.NODE_ENV === 'production';

    // Set secure HttpOnly refresh token
    res.cookie('refreshToken', response.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Set lightweight non-sensitive session indicator for client-side auth initialization
    res.cookie(SESSION_COOKIE_NAME, 'active', {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { refreshToken: _, ...responseWithoutRefreshToken } = response;

    return res.status(200).json(responseWithoutRefreshToken);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      this.clearAuthCookies(res);
      throw new AppError('Refresh token is required', 401);
    }

    try {
      const response = await this.authService.refreshAccessToken(refreshToken);
      return res.status(200).json(response);
    } catch (error) {
      this.clearAuthCookies(res);
      throw error;
    }
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        await this.authService.logout(refreshToken);
      } catch {
        // Ignore already-expired or already-revoked refresh tokens on logout
      }
    }

    this.clearAuthCookies(res);

    return res.status(204).send();
  }
}
