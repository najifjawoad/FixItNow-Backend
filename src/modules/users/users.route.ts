import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "./users.controller";

const router =Router();

router.patch("/update-my-profile" ,auth(Role.ADMIN,Role.CUSTOMER, Role.TECHNICIAN),userController.updateMyProfile)

router.get("/technicians" , auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN), userController.getAllTechnicians);


router.get("/get-my-bookings" , auth(Role.CUSTOMER, Role.TECHNICIAN), userController.getMyBookings )

router.get("/get-booking-details/:id" , auth(Role.CUSTOMER, Role.TECHNICIAN) , userController.getBookingDetails)

router.get("/services", userController.getAllServices);



export const userRoutes = router;