import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { technicianServices } from "./technician.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

// create services :
const createServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const payload = req.body;

    const result = await technicianServices.createServices(
      userId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service created successfully",
      data: result,
    });
  },
);

// create  availability :
const createAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const payload = req.body;

    const result = await technicianServices.createAvailability(
      userId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability added successfully",
      data: result,
    });
  },
);

// get all categories :
const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await technicianServices.getAllCategories();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `All categories fetched successfully`,
      data: result,
    });
  },
);

// update availability :
const updateAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const payload = req.body;

    const result = await technicianServices.updateAvailability(
      userId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Availability updated successfully",
      data: result,
    });
  },
);

// update user's booking status :
const updateUsersBookingStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    // const { status } = req.body;
    const { bookingId } = req.params;

   

    const result = await technicianServices.updateBookingStatus(
      userId as string,
      bookingId as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User's booking status updated successfully",
      data: result,
    });
  },
);

export const technicianController = {
  createServices,
  createAvailability,
  getAllCategories,
  updateAvailability,
  updateUsersBookingStatus,
};
