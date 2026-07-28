"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { storeSchema, userSchema } from "@/src/lib/validations";
import bcrypt from "bcryptjs";
import type { StoreInput, UserInput } from "@/src/types";
import { revalidatePath } from "next/cache";

export async function getStore() {
  const store = await prisma.store.findUnique({ where: { id: "default" } });
  if (!store) {
    return prisma.store.create({ data: { id: "default" } });
  }
  return {
    ...store,
    taxRate: Number(store.taxRate),
  };
}

export async function updateStore(data: StoreInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Admin only");

  const validated = storeSchema.parse(data);
  const store = await prisma.store.update({
    where: { id: "default" },
    data: validated,
  });

  revalidatePath("/settings");
  return { ...store, taxRate: Number(store.taxRate) };
}

export async function getUsers() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(data: UserInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Admin only");

  const validated = userSchema.parse(data);
  if (!validated.password) throw new Error("Password is required");

  const hashed = await bcrypt.hash(validated.password, 12);

  const user = await prisma.user.create({
    data: {
      name: validated.name,
      email: validated.email,
      password: hashed,
      role: validated.role,
      active: validated.active,
    },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  revalidatePath("/settings");
  return user;
}

export async function updateUser(id: string, data: UserInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Admin only");

  const validated = userSchema.parse(data);

  const updateData: Record<string, unknown> = {
    name: validated.name,
    email: validated.email,
    role: validated.role,
    active: validated.active,
  };

  if (validated.password) {
    updateData.password = await bcrypt.hash(validated.password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  revalidatePath("/settings");
  return user;
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Admin only");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/settings");
}