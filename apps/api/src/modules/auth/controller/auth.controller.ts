import { Request, Response } from "express";

import { RegisterDto, LoginDto } from "../dto";
import { AuthService } from "../service";

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

    return res.status(200).json(response);
  }
}
