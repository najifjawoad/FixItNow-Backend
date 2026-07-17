import { Request, Response } from "express";
import httpStatus from "http-status";
import { authService } from "./auth.service";

const registerUser = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const user = await authService.registerUserIntoDb(payload);

    return res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully.",
      data: user,
    });
  } catch (error: any) {
    console.log(error.message);
    
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success : false,
        statusCode : httpStatus.INTERNAL_SERVER_ERROR,
        message : "Failed to register user",
        error: error.message

    })
  }
};

export const authController = {
  registerUser,
};
