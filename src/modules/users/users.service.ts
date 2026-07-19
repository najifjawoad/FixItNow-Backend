import { NextFunction, Request, Response } from "express";
import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus  from "http-status";
import { GetServicesFilters } from "./users.interface";
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

// get all services with filter :
const getAllServices = async (filters: GetServicesFilters) => {
  const {
    categoryId,
    search,
    minPrice,
    maxPrice,
    minRating,
    sortBy = "newest",
    sortOrder = "desc",
    page = "1",
    limit = "10",
  } = filters;

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50); 
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  if (minRating) {
    where.technician = {
      avgRating: { gte: Number(minRating) },
    };
  }

  const orderBy: any =
    sortBy === "price"
      ? { price: sortOrder }
      : sortBy === "rating"
      ? { technician: { avgRating: sortOrder } }
      : { createdAt: sortOrder };

  const [services, total] = await prisma.$transaction([
    prisma.service.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        category: true,
        technician: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.service.count({ where }),
  ]);

  return {
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    data: services,
  };
};

export const userService = {
  updateMyProfile,
  getTechnicianProfiles,
  getMyBookings,
  getBookingDetails,
  getAllServices
};
