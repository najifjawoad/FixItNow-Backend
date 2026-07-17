import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterUserPayload } from "./auth.interface";
import config from "../../config";

const registerUserIntoDb = async (payload: RegisterUserPayload) => {
  const { name, email, password, phone, role, bio, experienceYears, skills } =
    payload;

  if (!name || !email || !password || !role) {
    throw new Error("Please provide all required fields.");
  }

  if (!["CUSTOMER", "TECHNICIAN"].includes(role)) {
    throw new Error("Invalid role.");
  }

  if (role === "TECHNICIAN") {
    if (
      !bio ||
      experienceYears === undefined ||
      !skills ||
      !Array.isArray(skills) ||
      skills.length === 0
    ) {
      throw new Error(
        "Please provide bio, experience years and at least one skill.",
      );
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
      },
    });

    if (role === "TECHNICIAN") {
      await tx.technicianProfile.create({
        data: {
          userId: newUser.id,
          bio,
          experienceYears,
          skills,
        },
      });
    }

    return tx.user.findUnique({
      where: {
        id: newUser.id,
      },
      omit: {
        password: true,
      },
      include: {
        technicianProfile: true,
      },
    });
  });
  return user;
};

export const authService = {
  registerUserIntoDb,
};
