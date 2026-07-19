import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./users.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";

// Update my Profile :
const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;

    const updatedProfile = await userService.updateMyProfile(userId, payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile Update Successful",
      data: updatedProfile,
    });
  },
);

// get technicians profiles:
const getTechnicianProfiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.getTechnicianProfiles();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technicians profile fetched successfully",
      data: result,
    });
  },
);

// get my bookings :

const getMyBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const role = req.user?.role;

    const result = await userService.getMyBookings(
      userId as string,
      role as Role,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Bookings retrieved successfully",
      data: result,
    });
  },
);

// get booking details :

const getBookingDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await userService.getBookingDetails(id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking details retrieved successfully",
      data: result,
    });
  },
);

// get all services with filter :
const getAllServices = catchAsync(async (req: Request, res: Response , next: NextFunction) => {
  const result = await userService.getAllServices(req.query);

sendResponse(res ,  {
    success: true,
    statusCode: httpStatus.OK,
    message: "Services retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});


export const userController = {
  updateMyProfile,
  getTechnicianProfiles,
  getMyBookings,
  getBookingDetails,
  getAllServices
};
