import { prisma } from "../../lib/prisma";
import { CreateServicePayload } from "./technician.interface";

const createServices = async (
  userId: string,
  payload: CreateServicePayload,
) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found");
  }

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) {
    throw new Error("Invalid category");
  }

  const service = await prisma.service.create({
    data: {
      technicianId: technician.id,
      categoryId: payload.categoryId,
      title: payload.title,
      description: payload.description,
      price: payload.price,
      durationMinutes: payload.durationMinutes,
    },
    include: {
      category: true,
    },
  });

  return service;
};

export const technicianServices = {
  createServices,
};
