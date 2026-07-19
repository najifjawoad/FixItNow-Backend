import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { authService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwtTokens";
// register-user controller :
const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const user = await authService.registerUserIntoDb(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully 🥳",
      data: { user },
    });
  },
);

// login-user controller :
const logInUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const { accessToken, refreshToken } = await authService.logInUser(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, //24 hour or ek din
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 din
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Logged In Successfully",
      data: { accessToken, refreshToken },
    });
  },
);

// Get my profile controller
const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await authService.getMyProfile(
      req.user?.id as string,
      req.user?.role as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Retrieved My Profile Info",
      data: profile,
    });
  },
);

// refresh token :
const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    const { accessToken } = await authService.refreshToken(refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, //24 hour or ek din
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  },
);
export const authController = {
  registerUser,
  logInUser,
  getMyProfile,
  refreshToken,
};
