import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { studentRegisterSchema, teacherRegisterSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body; // "student" or "teacher"

    if (type === "student") {
      const result = studentRegisterSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: "بيانات غير صالحة", details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { fullName, email, password, phone, gender, parentPhone, school, age, grade } = result.data;

      // Check if email already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مسجل بالفعل" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          phone: phone || null,
          role: "STUDENT",
          studentProfile: {
            create: {
              gender: gender || null,
              parentPhone: parentPhone || null,
              school: school || null,
              age: age || null,
              grade,
            },
          },
          wallet: {
            create: { balance: 0 },
          },
        },
      });

      return NextResponse.json(
        { message: "تم إنشاء الحساب بنجاح", userId: user.id },
        { status: 201 }
      );

    } else if (type === "teacher") {
      const result = teacherRegisterSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { error: "بيانات غير صالحة", details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { fullName, email, password, phone, specialization, bio, qualifications } = result.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مسجل بالفعل" },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          phone: phone || null,
          role: "TEACHER",
          teacherProfile: {
            create: {
              specialization: specialization || null,
              bio: bio || null,
              qualifications: qualifications || null,
            },
          },
          wallet: {
            create: { balance: 0 },
          },
        },
      });

      return NextResponse.json(
        { message: "تم إنشاء حساب المدرس بنجاح - في انتظار الموافقة", userId: user.id },
        { status: 201 }
      );

    } else {
      return NextResponse.json(
        { error: "نوع الحساب غير صالح" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
