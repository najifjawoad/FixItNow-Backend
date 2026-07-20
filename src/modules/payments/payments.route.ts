import express from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentsControllers } from "./payment.controller";



const router = express.Router();

router.post("/create", auth(Role.CUSTOMER), paymentsControllers.createPayment);

router.get("/my-payments", auth(Role.CUSTOMER , Role.TECHNICIAN), paymentsControllers.getMyPayments);

router.get("/:id",auth(Role.CUSTOMER , Role.TECHNICIAN), paymentsControllers.getPaymentById);

export const paymentsRoutes = router;