import { Router } from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.get("/allUsers" ,auth(Role.ADMIN ,Role.CUSTOMER, Role.TECHNICIAN) , adminController.getAllUsers)

router.patch("/updateUserStatus/:id",auth(Role.ADMIN) ,adminController.updateUserStatus)


export const adminRoutes = router;