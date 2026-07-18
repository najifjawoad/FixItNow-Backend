import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianServices } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";


const createServices = catchAsync(async(req: Request, res: Response, next : NextFunction)=>{


    const userId = req.user?.id;
    const payload = req.body;


    const result = await technicianServices.createServices(userId  as string,payload );

    sendResponse(res, {
      success: true,
      statusCode : httpStatus.OK,
      message: "Service created successfully",
      data: result,
    })

})

export const technicianController= {
    createServices
}