import { Request, Response } from "express";

import { RegisterDto } from "../dto";
import { AuthService } from "../service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response) {
    const data = req.body as RegisterDto;

    const user = await this.authService.register(data);

    return res.status(201).json(user);
  }
}
