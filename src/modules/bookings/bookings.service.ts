import { prisma } from "../../lib/prisma";
import { CreateBookingPayload } from "./bookings.interface";

const createBooking = async (customerId: string, payload: CreateBookingPayload) => {
  if (!payload.serviceId || !payload.availabilityId || !payload.address) {
    throw new Error("serviceId, availabilityId and address are required");
  }

  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  const booking = await prisma.$transaction(async (tx) => {
    const slot = await tx.availability.findUnique({
      where: { id: payload.availabilityId },
    });

    if (!slot) {
      throw new Error("Availability slot not found");
    }

    if (slot.technicianId !== service.technicianId) {
      throw new Error("This availability slot does not belong to the selected service's technician");
    }

    if (slot.isBooked) {
      throw new Error("This slot is already booked");
    }

   
    const datePart = slot.date.toISOString().split("T")[0];
    const scheduledAt = new Date(`${datePart}T${slot.startTime}:00.000Z`);

    if (isNaN(scheduledAt.getTime())) {
      throw new Error("Could not derive a valid scheduled time from this slot");
    }

    const newBooking = await tx.booking.create({
      data: {
        customerId,
        technicianId: service.technicianId,
        serviceId: service.id,
        availabilityId: slot.id,
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


    await tx.availability.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    return newBooking;
  });

  return booking;
};

export const bookingServices = {
  createBooking,
};