import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.post("/services" ,auth(Role.TECHNICIAN) ,technicianController.createServices );

router.post("/availability", auth(Role.TECHNICIAN), technicianController.createAvailability)

// Get all categories :
router.get("/allCategories" , auth(Role.ADMIN , Role.TECHNICIAN)  , technicianController.getAllCategories);

// update availability :
router.patch("/update-availability" , auth(Role.TECHNICIAN) , technicianController.updateAvailability)


export const technicianRoutes = router;