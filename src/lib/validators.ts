import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const studentRegisterSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "رقم الهاتف غير صالح").optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  parentPhone: z.string().optional().or(z.literal("")),
  school: z.string().optional().or(z.literal("")),
  age: z.coerce.number().min(14).max(25).optional(),
  grade: z.enum(["FIRST", "SECOND", "THIRD"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export const teacherRegisterSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
  phone: z.string().optional().or(z.literal("")),
  specialization: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  qualifications: z.string().optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type TeacherRegisterInput = z.infer<typeof teacherRegisterSchema>;
