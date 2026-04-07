import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      parentPhone: user.studentProfile?.parentPhone || "",
      school: user.studentProfile?.school || "",
      grade: user.studentProfile?.grade || "",
      gender: user.studentProfile?.gender || "",
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, parentPhone, school } = body;

    // Update user basic fields
    const updateData: Record<string, string> = {};
    if (fullName && fullName.trim().length >= 2) updateData.fullName = fullName.trim();
    if (phone) updateData.phone = phone.trim();

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Update student profile fields
    const profileData: Record<string, string | undefined> = {};
    if (parentPhone !== undefined) profileData.parentPhone = parentPhone.trim() || null as any;
    if (school !== undefined) profileData.school = school.trim() || null as any;

    if (Object.keys(profileData).length > 0) {
      await prisma.studentProfile.updateMany({
        where: { userId },
        data: profileData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث الملف الشخصي" }, { status: 500 });
  }
}
