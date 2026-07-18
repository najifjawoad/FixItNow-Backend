import { Status } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// get all users :
const getAllUsers = async () => {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    omit :{
      password : true
    }
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

export const adminService = {
  getAllUsers,
  updateUserStatus,
};
