import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Get all users :
router.get("/allUsers" ,auth(Role.ADMIN ,Role.CUSTOMER, Role.TECHNICIAN) , adminController.getAllUsers)

// Update user status :
router.patch("/updateUserStatus/:id",auth(Role.ADMIN) ,adminController.updateUserStatus);

// Create new service category :
router.post("/categories" , auth(Role.ADMIN), adminController.createCategories);

// Get all categories :
router.get("/allCategories" , auth(Role.ADMIN)  , adminController.getAllCategories);

// Get all bookings : 
router.get("/allBookings" , auth(Role.ADMIN)  ,adminController.getAllBookings );



export const adminRoutes = router;