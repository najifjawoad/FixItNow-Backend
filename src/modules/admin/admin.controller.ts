import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";

// get all users :
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUsers();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All users retrieved successfully",
      data: result,
    });
  },
);

// Update user status :
const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await adminService.updateUserStatus(id as string, status);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `User  status is updated`,
      data: result,
    });
  },
);

// create categories :
const createCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await adminService.createCategories(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Added a category`,
      data: result,
    });
  },
);

// get all categories :

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllCategories();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `All categories fetched successfully`,
      data: result,
    });
  },
);

// get all bookings
const getAllBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllBookings();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `All bookings fetched successfully`,
      data: result,
    });
  },
);

export const adminController = {
  getAllUsers,
  updateUserStatus,
  createCategories,
  getAllCategories,
  getAllBookings,
};
