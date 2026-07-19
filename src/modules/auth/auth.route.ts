import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";

import { Role } from "../../../generated/prisma/enums";


import { auth } from "../../middlewares/auth";

const router = Router();


router.post("/register", authController.registerUser);
router.post("/login", authController.logInUser);


router.get(
  "/me",
  auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  authController.getMyProfile,
);


router.post("/refresh-token" , authController.refreshToken)

export const authRoutes = router;
