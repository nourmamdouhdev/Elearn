import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "معرف الكورس مطلوب" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorite: false });
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: { userId, courseId },
      });
      return NextResponse.json({ isFavorite: true });
    }
  } catch (error) {
    console.error("Favorite toggle error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
