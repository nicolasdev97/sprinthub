import { Request, Response } from "express";

import { UserService } from "../service";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUser(req: Request, res: Response) {
    const userId = req.user.userId;

    const user = await this.userService.getUserById(userId);

    res.status(200).json(user);
  }
}
