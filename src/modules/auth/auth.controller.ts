import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { authService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

// register-user controller :
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

// login-user controller :

const logInUser = catchAsync(async(req: Request , res: Response , next: NextFunction)=>{

    const payload = req.body;

    const logInResult = await authService.logInUser(payload);

    sendResponse(res , {
        success : true,
        statusCode : httpStatus.OK,
        message : "Logged In Successfully",
        data :logInResult
    })

})
export const authController = {
  registerUser,
  logInUser
};
