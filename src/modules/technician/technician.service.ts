import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  AddAvailabilityPayload,
  CreateServicePayload,
  UpdateAvailabilityPayload,
  UpdateBookingStatusPayload,
} from "./technician.interface";

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

// Helper function to normalize time string to HH:mm (e.g. "9:00" -> "09:00")
const normalizeTimeString = (timeStr: string): string => {
  if (!timeStr) return timeStr;
  const parts = timeStr.trim().split(":");
  if (parts.length < 2 || !parts[0] || !parts[1]) return timeStr;
  const hours = parts[0].padStart(2, "0");
  const minutes = parts[1].padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper function to get YYYY-MM-DD string cleanly for date comparison
const getYYYYMMDD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// create availability :
const createAvailability = async (
  userId: string,
  payload: AddAvailabilityPayload,
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const startTime = normalizeTimeString(payload.startTime);
  const endTime = normalizeTimeString(payload.endTime);

  if (startTime >= endTime) {
    throw new Error("startTime must be before endTime");
  }

  const slotDate = new Date(payload.date);

  if (isNaN(slotDate.getTime())) {
    throw new Error("Invalid date");
  }

  const slotDateStr = getYYYYMMDD(slotDate);
  const todayStr = getYYYYMMDD(new Date());

  if (slotDateStr < todayStr) {
    throw new Error("Cannot add availability for a past date");
  }

  const overlap = await prisma.availability.findFirst({
    where: {
      technicianId: technicianProfile.id,
      date: slotDate,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (overlap) {
    throw new Error("This slot overlaps with an existing availability slot");
  }

  const availability = await prisma.availability.create({
    data: {
      technicianId: technicianProfile.id,
      date: slotDate,
      startTime,
      endTime,
    },
  });

  return availability;
};

// get all categories :
const getAllCategories = async () => {
  return await prisma.category.findMany();
};

// Update Availability slots :
const updateAvailability = async (
  userId: string,
  payload: UpdateAvailabilityPayload,
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const availability = await prisma.availability.findUnique({
    where: {
      id: payload.availabilityId,
    },
  });

  if (!availability) {
    throw new Error("Availability slot not found");
  }

  if (availability.technicianId !== technicianProfile.id) {
    throw new Error("You are not authorized to update this slot");
  }

  if (availability.isBooked) {
    throw new Error("Booked slots cannot be updated");
  }

  const startTime = normalizeTimeString(payload.startTime);
  const endTime = normalizeTimeString(payload.endTime);

  if (startTime >= endTime) {
    throw new Error("startTime must be before endTime");
  }

  const slotDate = new Date(payload.date);

  if (isNaN(slotDate.getTime())) {
    throw new Error("Invalid date");
  }

  const slotDateStr = getYYYYMMDD(slotDate);
  const todayStr = getYYYYMMDD(new Date());

  if (slotDateStr < todayStr) {
    throw new Error("Cannot update availability for a past date");
  }

  const overlap = await prisma.availability.findFirst({
    where: {
      technicianId: technicianProfile.id,
      id: {
        not: payload.availabilityId,
      },
      date: slotDate,
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
  });

  if (overlap) {
    throw new Error("This slot overlaps with another availability slot");
  }

  return prisma.availability.update({
    where: {
      id: payload.availabilityId,
    },
    data: {
      date: slotDate,
      startTime,
      endTime,
    },
  });
};

// delete availability slot :
const deleteAvailability = async (userId: string, availabilityId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const availability = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });

  if (!availability) {
    throw new Error("Availability slot not found");
  }

  if (availability.technicianId !== technicianProfile.id) {
    throw new Error("Unauthorized to delete this availability slot");
  }

  if (availability.isBooked) {
    throw new Error("Booked availability slots cannot be deleted");
  }

  return prisma.availability.delete({
    where: { id: availabilityId },
  });
};

// Update booking status :
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ["ACCEPTED", "DECLINED"],
  ACCEPTED: ["PAID", "CANCELLED"],
  DECLINED: [],
  PAID: ["IN_PROGRESS", "COMPLETED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

const VALID_STATUSES: BookingStatus[] = [
  "ACCEPTED",
  "DECLINED",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  payload: UpdateBookingStatusPayload,
) => {
  const { status } = payload;

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.technicianId !== technicianProfile.id) {
    throw new Error("This booking does not belong to you");
  }

  const allowedStatuses = ALLOWED_TRANSITIONS[booking.status];

  if (!allowedStatuses.includes(status)) {
    throw new Error(`Cannot move booking from ${booking.status} to ${status}`);
  }

  return prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status,
      },
    });

    if (status === "DECLINED" || status === "CANCELLED") {
      await tx.availability.update({
        where: {
          id: booking.availabilityId,
        },
        data: {
          isBooked: false,
        },
      });
    }

    return updatedBooking;
  });
};

// get my services:
const getMyServices = async (userId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  return prisma.service.findMany({
    where: { technicianId: technicianProfile.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

// update service:
const updateService = async (
  userId: string,
  serviceId: string,
  payload: Partial<CreateServicePayload>,
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (service.technicianId !== technicianProfile.id) {
    throw new Error("Unauthorized to update this service");
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.price && { price: payload.price }),
      ...(payload.durationMinutes && { durationMinutes: payload.durationMinutes }),
      ...(payload.categoryId && { categoryId: payload.categoryId }),
    },
    include: { category: true },
  });
};

// delete service:
const deleteService = async (userId: string, serviceId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (service.technicianId !== technicianProfile.id) {
    throw new Error("Unauthorized to delete this service");
  }

  return prisma.service.delete({
    where: { id: serviceId },
  });
};

export const technicianServices = {
  createServices,
  createAvailability,
  getAllCategories,
  updateAvailability,
  deleteAvailability,
  updateBookingStatus,
  getMyServices,
  updateService,
  deleteService,
};
