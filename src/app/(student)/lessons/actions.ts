"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitExamAttempt(lessonId: string, examId: string, answers: Record<string, string>) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // Fetch the exam questions and correct answers
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        include: {
          options: true
        }
      }
    }
  });

  if (!exam) throw new Error("Exam not found");

  let correctCount = 0;
  const totalQuestions = exam.questions.length;

  exam.questions.forEach(q => {
    const selectedOptionId = answers[q.id];
    const correctOption = q.options.find(o => o.isCorrect);
    if (selectedOptionId === correctOption?.id) {
      correctCount++;
    }
  });

  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 100;
  const passed = score >= exam.passingScore;

  // Record the attempt
  await prisma.examAttempt.create({
    data: {
      examId,
      studentId: userId,
      score,
      passed
    }
  });

  revalidatePath(`/student/lessons/${lessonId}`);
  return { score, passed };
}
