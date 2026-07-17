import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { ILogInUser, RegisterUserPayload } from "./auth.interface";
import config from "../../config";
import jwt, { SignOptions } from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwtTokens";

// Register-user service :
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

// Login-user service :
const logInUser = async (payload: ILogInUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error("Incorrect Password");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  registerUserIntoDb,
  logInUser,
};
