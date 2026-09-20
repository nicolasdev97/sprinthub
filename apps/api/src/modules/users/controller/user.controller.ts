import { Request, Response } from "express";

import { UserService } from "../service";
import { UpdateUserDto } from "../dto";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUser(req: Request, res: Response) {
    const userId = req.user.userId;

    const user = await this.userService.getUserById(userId);

    res.status(200).json(user);
  }

  async updateUser(
    req: Request<unknown, unknown, UpdateUserDto>,
    res: Response,
  ) {
    const userId = req.user.userId;

    const user = await this.userService.updateUser(userId, req.body);

    res.status(200).json(user);
  }
}
