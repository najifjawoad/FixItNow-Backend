import { Status } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICrerateCategory } from "./admin.interface";

// get all users :
const getAllUsers = async () => {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    omit: {
      password: true,
    },
  });
};

//   Update user Status :
const updateUserStatus = async (userId: string, status: Status) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      status,
    },
    omit: {
      password: true,
    },
  });

  return updatedUser;
};

// create categories :
const createCategories = async (payload: ICrerateCategory) => {
  const { name, description } = payload;

  const existing = await prisma.category.findUnique({
    where: { name },
  });
  if (existing) {
    throw new Error("Category already exists");
  }

  const category = await prisma.category.create({
    data: { name, description },
  });

  return category;
};

// get all categories :
const getAllCategories = async () => {
  return await prisma.category.findMany();
};

// get all bookings :
const getAllBookings = async () => {
  return await prisma.booking.findMany();
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  createCategories,
  getAllCategories,
  getAllBookings,
};
