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
const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllTechnicians(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Technicians retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

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
const getAllServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.getAllServices(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Services retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

// get technician profiles with review :
const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.getTechnicianById(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician profile retrieved successfully",
    data: result,
  });
});

// CREATE REVIEW :
const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await userService.createReview(customerId as string, req.body);

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review submitted successfully",
    data: result,
  });
});

export const userController = {
  updateMyProfile,
  getAllTechnicians,
  getMyBookings,
  getBookingDetails,
  getAllServices,
  getTechnicianById,
  createReview
};
