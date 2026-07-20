import { Request, Response } from "express";
import httpStatus from "http-status";


import { stripe } from "../../lib/stripe";
import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";

import { Role } from "../../../generated/prisma/enums";
import { paymentsServices } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await paymentsServices.createPayment(customerId as string, req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Payment initiated",
    data: result,
  });
});


const confirmPayment = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
 
  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig,
      config.stripe_webhook_secret as string
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
 console.log("Webhook Event:", event.type);
  await paymentsServices.confirmPayment(event);

  res.status(httpStatus.OK).json({ received: true });
};

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
//   const { id: userId, role } = req.user?;
const userId = req.user?.id;
const role = req.user?.role;
 
  if (role !== "CUSTOMER" && role !== "TECHNICIAN") {
    throw new Error("Invalid role");
  }


  const result = await paymentsServices.getMyPayments(userId as string, role );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
//   const { id: userId, role } = req.user 
const userId = req.user?.id;
const role = req.user?.role;
  const { id: paymentId } = req.params;
  const result = await paymentsServices.getPaymentById(userId as string, role as Role, paymentId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

export const paymentsControllers = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};