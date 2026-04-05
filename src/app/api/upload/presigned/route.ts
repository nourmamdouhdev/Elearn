import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePresignedUploadUrl } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const role = (session?.user as any)?.role;

    if (!userId || role !== "TEACHER") {
      return NextResponse.json({ error: "غير مصرح لك برفع الملفات" }, { status: 401 });
    }

    const { filename, contentType, type, courseId } = await req.json();

    if (!filename || !contentType || !courseId) {
      return NextResponse.json({ error: "بيانات الملف غير مكتملة" }, { status: 400 });
    }

    // Verify teacher owns the course
    const teacherProfile = await prisma.teacherProfile.findFirst({ where: { userId } });
    if (!teacherProfile) return NextResponse.json({ error: "حساب معلم غير صالح" }, { status: 401 });

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: teacherProfile.id }
    });

    if (!course) {
      return NextResponse.json({ error: "ليس لديك صلاحية على هذا الكورس" }, { status: 403 });
    }

    // Generate unique file path
    const extension = filename.split('.').pop()?.toLowerCase();
    const uniqueId = uuidv4();
    
    let pathPrefix = "attachments";
    if (type === "VIDEO") pathPrefix = "videos";
    if (type === "THUMBNAIL") pathPrefix = "thumbnails";

    const key = `courses/${courseId}/${pathPrefix}/${uniqueId}.${extension}`;

    const presignedData = await generatePresignedUploadUrl(key, contentType);

    return NextResponse.json({
      uploadUrl: presignedData.uploadUrl,
      publicUrl: presignedData.publicUrl,
      key
    });

  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json({ error: "فشل في إنشاء رابط الرفع" }, { status: 500 });
  }
}
