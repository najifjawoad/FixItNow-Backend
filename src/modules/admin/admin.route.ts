import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.get("/allUsers" ,auth(Role.ADMIN ,Role.CUSTOMER, Role.TECHNICIAN) , adminController.getAllUsers)

router.patch("/updateUserStatus/:id",auth(Role.ADMIN) ,adminController.updateUserStatus);


router.post("/categories" , auth(Role.ADMIN), adminController.createCategories);

router.get("/allCategories" , auth(Role.ADMIN)  , adminController.getAllCategories)

router.get("/allBookings" , auth(Role.ADMIN)  ,adminController.getAllBookings )



export const adminRoutes = router;