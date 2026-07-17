import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { authService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";


const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const user = await authService.registerUserIntoDb(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully 🥳",
      data: {user},
    });
  },
);
export const authController = {
  registerUser,
};
