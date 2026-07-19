import { prisma } from "../../lib/prisma";

import { AddAvailabilityPayload, CreateServicePayload } from "./technician.interface";

// create services :
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

// create availability :
const createAvailability = async (userId: string, payload: AddAvailabilityPayload) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  if (payload.startTime >= payload.endTime) {
    throw new Error("startTime must be before endTime");
  }

  const slotDate = new Date(payload.date);

  if (isNaN(slotDate.getTime())) {
    throw new Error("Invalid date");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (slotDate < today) {
    throw new Error("Cannot add availability for a past date");
  }

  const overlap = await prisma.availability.findFirst({
    where: {
      technicianId: technicianProfile.id,
      date: slotDate,
      startTime: { lt: payload.endTime },
      endTime: { gt: payload.startTime },
    },
  });

  if (overlap) {
    throw new Error("This slot overlaps with an existing availability slot");
  }

  const availability = await prisma.availability.create({
    data: {
      technicianId: technicianProfile.id,
      date: slotDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
    },
  });

  return availability;
};

// get all categories :
const getAllCategories = async () => {
  return await prisma.category.findMany();
};

export const technicianServices = {
  createServices,
  createAvailability,
  getAllCategories,
};