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
        lt: payload.endTime,
      },
      endTime: {
        gt: payload.startTime,
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
      startTime: payload.startTime,
      endTime: payload.endTime,
    },
  });
};

// Update booking status :
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ["ACCEPTED", "DECLINED"],
  ACCEPTED: ["PAID", "CANCELLED"],
  DECLINED: [],
  PAID: ["IN_PROGRESS"],
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

export const technicianServices = {
  createServices,
  createAvailability,
  getAllCategories,
  updateAvailability,
  updateBookingStatus,
};
