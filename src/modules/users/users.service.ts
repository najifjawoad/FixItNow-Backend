import { NextFunction, Request, Response } from "express";
import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus  from "http-status";
import { GetServicesFilters, GetTechniciansFilters } from "./users.interface";
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

// get technician profiles with filter :
const getAllTechnicians = async (filters: GetTechniciansFilters) => {
  const {
    search,
    skill,
    minExperience,
    minRating,
    verified,
    sortBy = "newest",
    sortOrder = "desc",
    page = "1",
    limit = "10",
  } = filters;

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.user = { name: { contains: search, mode: "insensitive" } };
  }

  if (skill) {
    where.skills = { has: skill };
  }

  if (minExperience) {
    where.experienceYears = { gte: Number(minExperience) };
  }

  if (minRating) {
    where.avgRating = { gte: Number(minRating) };
  }

  if (verified !== undefined) {
    where.verified = verified === "true";
  }

  const orderBy: any =
    sortBy === "rating"
      ? { avgRating: sortOrder }
      : sortBy === "experience"
      ? { experienceYears: sortOrder }
      : { createdAt: sortOrder };

  const [technicians, total] = await prisma.$transaction([
    prisma.technicianProfile.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        services: { include: { category: true } },
        reviews : true,
      },
    }),
    prisma.technicianProfile.count({ where }),
  ]);

  return {
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    data: technicians,
  };
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

// get technician profiles with review :
const getTechnicianById = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      services: { include: { category: true } },
      availability: {
        where: { isBooked: false }, // only show open slots publicly
        orderBy: { date: "asc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!technician) {
    throw new Error("Technician not found");
  }

  return technician;
};





export const userService = {
  updateMyProfile,
  getAllTechnicians,
  getMyBookings,
  getBookingDetails,
  getAllServices,
  getTechnicianById
};
