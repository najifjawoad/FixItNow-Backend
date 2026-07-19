import { prisma } from "../../lib/prisma";
import { CreateBookingPayload } from "./bookings.interface";

const createBookings = async (
  customerId: string,
  payload: CreateBookingPayload,
) => {
  const service = await prisma.service.findUnique({
    where: {
      id: payload.serviceId,
    },
    include: { technician: true },
  });
  if (!service) {
    throw new Error("Service not found");
  }

  const scheduledAt = new Date(payload.scheduledAt);
  if (scheduledAt <= new Date()) {
    throw new Error("scheduledAt must be in the future");
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      technicianId: service.technicianId,
      scheduledAt,
      status: { in: ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"] },
    },
  });
   if (conflict) {
    throw new Error("Technician is already booked at this time");
  }
    const booking = await prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId: service.id,
      scheduledAt,
      address: payload.address,
      notes: payload.notes,
      status: "REQUESTED",
    },
    include: {
      service: true,
      technician: { include: { user: true } },
    },
  });
 return booking;


};

export const bookingsService = {
  createBookings,
};
