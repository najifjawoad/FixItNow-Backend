import express from "express";



import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { bookingsController } from "./bookings.controller";

const router = express.Router();

router.post(
  "/",auth(Role.CUSTOMER),bookingsController.createBooking,
);

export const BookingRoutes = router;
