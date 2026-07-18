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

export const userService = {
  updateMyProfile,
  getTechnicianProfiles,
};
