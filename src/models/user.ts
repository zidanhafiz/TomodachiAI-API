import { Prisma } from "@prisma/client";
import { User } from "../types/user";
import prisma from "../utils/prisma";

const createUser = async ({
  email,
  firstName,
  lastName,
  password,
  role,
}: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "ADMIN" | "USER";
}) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password,
        role,
      },
    });
    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create user");
  }
};

const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user by email");
  }
};

const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        refreshToken: true,
        credits: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user by id");
  }
};

const updateUser = async (id: string, data: Partial<User>) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        credits: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update user");
  }
};

const deleteUser = async (id: string) => {
  try {
    const deletedUser = await prisma.user.delete({ where: { id } });
    return deletedUser;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete user");
  }
};

const listUsers = async ({
  name,
  email,
  role,
  page = 1,
  limit = 10,
}: {
  name?: string;
  email?: string;
  role?: "ADMIN" | "USER";
  page?: number;
  limit?: number;
}) => {
  try {
    const filter = {} as Prisma.UserWhereInput;

    if (name) {
      filter.OR = [{ firstName: { contains: name } }, { lastName: { contains: name } }];
    }

    if (email) {
      filter.email = { contains: email };
    }

    if (role) {
      filter.role = role;
    }

    if (Object.keys(filter).length === 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          credits: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return users;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        credits: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
    });

    return users;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to list users");
  }
};

const userModels = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
  listUsers,
};

export default userModels;
