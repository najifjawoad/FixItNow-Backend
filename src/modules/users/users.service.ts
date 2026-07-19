import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// Update my Profile :
const updateMyProfile = async (userId: string, payload: any) => {
  const { name, email, phone, role, bio, experienceYears, skills } = payload;

  if (role === "TECHNICIAN") {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
        technicianProfile: {
          update: {
            bio,
            experienceYears,
            skills,
          },
        },
      },
      omit: {
        password: true,
      },
      include: {
        technicianProfile: true,
      },
    });
    return updatedUser;
  }
  const updateUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      phone,
    },
    omit: {
      password: true,
    },
  });

  return updateUser;
};

// get technician profiles :
const getTechnicianProfiles = async () => {
  const technicianProfiles = await prisma.technicianProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return technicianProfiles;
};

// get my bookings :
const getMyBookings = async (userId: string, role: Role) => {
  if (role === "CUSTOMER") {
    const customersBookings = await prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        service: true,
        technician: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });
    return customersBookings;
  }

  if (role === "TECHNICIAN") {
    const technicianProfile = await prisma.technicianProfile.findUnique({
      where: { userId },
    });

    if (!technicianProfile) {
      throw new Error("Technician profile not found");
    }

    const techniciansBookings = await prisma.booking.findMany({
      where: { technicianId: technicianProfile.id },
      include: {
        service: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });
    return techniciansBookings;
  }

  throw new Error("Invalid role for this action");
};

// get booking details :
const getBookingDetails = async (bookingId: string) => {
  const bookingDetails = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
  });
  return bookingDetails;
};

export const userService = {
  updateMyProfile,
  getTechnicianProfiles,
  getMyBookings,
  getBookingDetails,
};
