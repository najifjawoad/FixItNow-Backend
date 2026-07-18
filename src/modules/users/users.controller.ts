import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./users.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus  from "http-status";


// Update my Profile :
const updateMyProfile = catchAsync(async(req : Request , res: Response , next: NextFunction)=>{

    const userId = req.user?.id as string;
    const payload = req.body;

    const updatedProfile = await userService.updateMyProfile(userId , payload);

    sendResponse(res , {
        success : true,
        statusCode : httpStatus.OK,
        message : "Profile Update Successful",
        data : updatedProfile
    })


})

// get technicians profiles:

const getTechnicianProfiles = catchAsync(async(req : Request , res: Response , next: NextFunction)=>{

    const result = await userService.getTechnicianProfiles();

        sendResponse(res , {
        success : true,
        statusCode : httpStatus.OK,
        message : "Technicians profile fetched successfully",
        data : result
    })

})


export const userController = {
    updateMyProfile,
    getTechnicianProfiles
}