import express from "express";



import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { bookingsController } from "./bookings.controller";

const router = express.Router();

router.post(
  "/", auth(Role.CUSTOMER), bookingsController.createBooking,
);

router.patch(
  "/:id/cancel", auth(Role.CUSTOMER), bookingsController.cancelBooking,
);

export const BookingRoutes = router;
