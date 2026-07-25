import { Request, Response } from "express";

export function healthController(
  _request: Request,
  response: Response,
): Response {
  return response.status(200).json({
    success: true,
    message: "SprintHub API is running",
  });
}
