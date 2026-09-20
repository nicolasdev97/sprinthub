import { Router } from "express";

import { authenticate, validate } from "../../../middleware";

import { updateUserSchema, deleteUserSchema } from "../schema";

import { UserController } from "../controller";
import { UserRepository } from "../repository";
import { UserService } from "../service";

export const userRouter = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

userRouter.get(
  "/me",
  authenticate,
  userController.getUser.bind(userController),
);

userRouter.patch(
  "/me",
  authenticate,
  validate(updateUserSchema),
  userController.updateUser.bind(userController),
);

userRouter.delete(
  "/me",
  authenticate,
  validate(deleteUserSchema),
  userController.deleteUser.bind(userController),
);

export default userRouter;
