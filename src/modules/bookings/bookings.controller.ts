import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { bookingsService } from "./bookings.service";

const createBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const payload = req.body;
    const result = await bookingsService.createBookings(
      customerId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking requested successfully",
      data: result,
    });
  },
);


export const bookingsController= {
    createBooking

}