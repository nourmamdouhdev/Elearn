"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generatePresignedUploadUrl } from "@/lib/storage";

export async function createCourse(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId }
  });

  if (!teacherProfile) {
    throw new Error("Teacher profile not found");
  }

  const titleAr = formData.get("titleAr") as string;
  const descriptionAr = formData.get("descriptionAr") as string;
  const subject = formData.get("subject") as string;
  const grade = formData.get("grade") as string;
  const price = parseFloat(formData.get("price") as string);

  const course = await prisma.course.create({
    data: {
      teacherId: teacherProfile.id,
      title: titleAr, // Defaulting title to titleAr since it's an Arabic platform
      titleAr,
      description: descriptionAr,
      descriptionAr,
      subject,
      grade,
      price,
      isPublished: false,
    }
  });

  redirect(`/teacher/courses/${course.id}/edit`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const teacherProfile = await prisma.teacherProfile.findFirst({
    where: { userId }
  });

  if (!teacherProfile) {
    throw new Error("Teacher profile not found");
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, teacherId: teacherProfile.id }
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const titleAr = formData.get("titleAr") as string;
  const descriptionAr = formData.get("descriptionAr") as string;
  const subject = formData.get("subject") as string;
  const grade = formData.get("grade") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const isPublished = formData.get("isPublished") === "on";

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: titleAr,
      titleAr,
      description: descriptionAr,
      descriptionAr,
      subject,
      grade,
      price,
      isPublished,
    }
  });

  revalidatePath(`/teacher/courses`);
  redirect(`/teacher/courses`);
}

export async function createLesson(courseId: string, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.findFirst({
    where: { 
      id: courseId, 
      teacher: { userId } 
    }
  });

  if (!course) {
    throw new Error("Course not found or unauthorized");
  }

  const titleAr = formData.get("titleAr") as string;

  const currentLessonsCount = await prisma.lesson.count({
    where: { courseId }
  });

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      title: titleAr,
      titleAr,
      sortOrder: currentLessonsCount + 1,
      isFree: false,
      price: 0,
      durationMinutes: 0,
      isPublished: false
    }
  });

  redirect(`/teacher/courses/${courseId}/lessons/${lesson.id}/content`);
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.findFirst({
    where: { 
      id: courseId, 
      teacher: { userId } 
    }
  });

  if (!course) {
    throw new Error("Unauthorized or course not found");
  }

  const durationMinutes = parseInt(formData.get("durationMinutes") as string) || 0;
  const isFree = formData.get("pricingType") === "FREE";
  const price = parseFloat(formData.get("price") as string) || 0;
  const accessDurationDays = parseInt(formData.get("accessDurationDays") as string) || 30;
  const isPublished = formData.get("isPublished") === "on";

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      durationMinutes,
      isFree,
      price: isFree ? 0 : price,
      accessDurationDays,
      isPublished
    }
  });

  revalidatePath(`/teacher/courses/${courseId}/lessons/${lessonId}/content`);
}

export async function createLessonContent(courseId: string, lessonId: string, type: "VIDEO" | "PDF", fileUrl: string, fileSizeMB: number) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.findFirst({
    where: { 
      id: courseId, 
      teacher: { userId } 
    }
  });

  if (!course) {
    throw new Error("Unauthorized");
  }

  const currentContentCount = await prisma.lessonContent.count({
    where: { lessonId: lessonId }
  });

  await prisma.lessonContent.create({
    data: {
      lessonId,
      type,
      fileUrl,
      fileSizeMB,
      sortOrder: currentContentCount + 1
    }
  });

  revalidatePath(`/teacher/courses/${courseId}/lessons/${lessonId}/content`);
}

export async function upsertExam(lessonId: string, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const passingScore = parseInt(formData.get("passingScore") as string) || 50;
  const maxAttempts = formData.get("maxAttempts") ? parseInt(formData.get("maxAttempts") as string) : null;

  await prisma.exam.upsert({
    where: { lessonId },
    update: { passingScore, maxAttempts },
    create: { lessonId, passingScore, maxAttempts }
  });

  revalidatePath(`/teacher/courses/any/lessons/${lessonId}/content`);
}

export async function addQuestion(examId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const text = formData.get("questionText") as string;
  const optionsJson = formData.get("options") as string; // Expecting JSON string of {text, isCorrect}[]
  const options = JSON.parse(optionsJson) as { text: string; isCorrect: boolean }[];

  const currentQuestionsCount = await prisma.question.count({ where: { examId } });

  await prisma.question.create({
    data: {
      examId,
      text,
      sortOrder: currentQuestionsCount + 1,
      options: {
        create: options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect
        }))
      }
    }
  });

  revalidatePath(`/teacher/courses/any/lessons/any/content`);
}

export async function deleteQuestion(questionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.question.delete({
    where: { id: questionId }
  });

  revalidatePath(`/teacher/courses/any/lessons/any/content`);
}

export async function updateQuestion(questionId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const text = formData.get("questionText") as string;
  const optionsJson = formData.get("options") as string;
  const options = JSON.parse(optionsJson) as { id?: string; text: string; isCorrect: boolean }[];

  // Update question text
  await prisma.question.update({
    where: { id: questionId },
    data: { text }
  });

  // Simple approach: delete old options and create new ones or update if ID exists
  // For simplicity here, we'll update text/isCorrect for existing IDs and create new ones
  for (const opt of options) {
    if (opt.id) {
      await prisma.answerOption.update({
        where: { id: opt.id },
        data: { text: opt.text, isCorrect: opt.isCorrect }
      });
    } else {
      await prisma.answerOption.create({
        data: {
          questionId,
          text: opt.text,
          isCorrect: opt.isCorrect
        }
      });
    }
  }

  revalidatePath(`/teacher/courses/any/lessons/any/content`);
}

export async function importQuestions(examId: string, questions: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currentQuestionsCount = await prisma.question.count({ where: { examId } });

  // Use a transaction for bulk import
  await prisma.$transaction(
    questions.map((q, idx) => 
      prisma.question.create({
        data: {
          examId,
          text: q.text,
          sortOrder: currentQuestionsCount + 1 + idx,
          options: {
            create: q.options.map((opt: any) => ({
              text: opt.text,
              isCorrect: opt.isCorrect
            }))
          }
        }
      })
    )
  );

  revalidatePath(`/teacher/courses/any/lessons/any/content`);
}

export async function getPresignedUrlForUpload(fileName: string, fileType: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const key = `uploads/${session.user.id}/${Date.now()}-${fileName}`;
  return await generatePresignedUploadUrl(key, fileType);
}

export async function deleteLessonContent(contentId: string, courseId: string, lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.lessonContent.delete({
    where: { id: contentId }
  });

  revalidatePath(`/teacher/courses/${courseId}/lessons/${lessonId}/content`);
}
