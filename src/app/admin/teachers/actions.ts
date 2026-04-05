"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function toggleTeacherApproval(teacherId: string, currentStatus: boolean) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.teacherProfile.update({
    where: { id: teacherId },
    data: { isApproved: !currentStatus }
  });

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
}
