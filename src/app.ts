import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";

import config from "./config";
import { prisma } from "./lib/prisma";
import { authRoutes } from "./modules/auth/auth.route";
import { userRoutes } from "./modules/users/users.route";
import { adminRoutes } from "./modules/admin/admin.route";
import { technicianRoutes } from "./modules/technician/technician.route";
import { BookingRoutes } from "./modules/bookings/bookings.route";
import { paymentsControllers } from "./modules/payments/payment.controller";
import { paymentsRoutes } from "./modules/payments/payments.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  })
);

app.post(
  "/api/payments/confirm",
  express.raw({ type: "application/json" }),
  paymentsControllers.confirmPayment
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello from FixItNow");
});


// Created routes manually :
app.use("/api/auth" ,authRoutes );
app.use("/api/users" , userRoutes);
app.use("/api/admin" , adminRoutes);
app.use("/api/technician" , technicianRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/payments", paymentsRoutes);


export default app;