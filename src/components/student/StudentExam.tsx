"use client";

import { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, PlayCircle } from "lucide-react";
import { submitExamAttempt } from "@/app/(student)/lessons/actions";

interface StudentExamProps {
  lessonId: string;
  exam: any;
  studentId: string;
}

export function StudentExam({ lessonId, exam, studentId }: StudentExamProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < exam.questions.length) {
      alert("يرجى الإجابة على جميع الأسئلة أولاً");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitExamAttempt(lessonId, exam.id, answers);
      setResult(res);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء إرسال الإجابات");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="flex-col items-center justify-center py-2xl gap-lg text-center animate-fade-in">
        {result.passed ? (
          <>
            <div className="p-xl bg-success-glow/20 rounded-full text-success mb-md">
              <CheckCircle2 size={64} />
            </div>
            <h2 className="text-2xl font-bold">مبروك! لقد نجحت</h2>
            <p className="text-secondary">درجتك: {result.score.toFixed(0)}% (درجة النجاح المطلوب: {exam.passingScore}%)</p>
            <p className="text-secondary mb-xl">يمكنك الآن مشاهدة الحصة وتحميل المرفقات!</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary px-2xl py-md">
              <PlayCircle size={20} className="ml-xs" /> ابدأ مشاهدة الحصة الآن
            </button>
          </>
        ) : (
          <>
            <div className="p-xl bg-error-glow/20 rounded-full text-error mb-md">
              <XCircle size={64} />
            </div>
            <h2 className="text-2xl font-bold">للأسف، لم يحالفك الحظ</h2>
            <p className="text-secondary">درجتك: {result.score.toFixed(0)}% (درجة النجاح المطلوب: {exam.passingScore}%)</p>
            <p className="text-secondary mb-xl">حاول مراجعة المادة جيداً والبدء من جديد.</p>
            <button onClick={() => setResult(null)} className="btn btn-outline px-2xl py-md">إعادة المحاولة</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-col gap-2xl py-xl animate-fade-in">
      <div className="flex items-center gap-md p-lg bg-primary-glow/5 border-primary-glow border rounded-xl">
        <div className="p-md bg-primary-glow/20 rounded-lg text-primary">
          <ClipboardCheck size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-xs">اختبار المتطلبات</h2>
          <p className="text-sm text-secondary">يجب عليك النجاح بنسبة {exam.passingScore}% لفتح محتوى هذه الحصة.</p>
        </div>
      </div>

      <div className="flex-col gap-lg max-w-2xl mx-auto w-full">
        {exam.questions.map((q: any, idx: number) => (
          <div key={q.id} className="card p-xl flex-col gap-lg border-hover transition-all">
            <h4 className="text-lg leading-relaxed">
              <span className="text-primary font-bold ml-xs">{idx + 1}.</span> {q.text}
            </h4>
            <div className="grid gap-md">
              {q.options.map((opt: any) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(q.id, opt.id)}
                  className={`flex items-center justify-between p-lg rounded-xl border-2 transition-all text-start ${
                    answers[q.id] === opt.id
                      ? "border-primary bg-primary-glow/10 shadow-lg scale-[1.01]"
                      : "border-border hover:border-secondary bg-card"
                  }`}
                >
                  <span className="text-md">{opt.text}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    answers[q.id] === opt.id ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {answers[q.id] === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-md mt-xl pb-2xl">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(answers).length < exam.questions.length}
          className="btn btn-primary btn-xl px-2xl shadow-xl hover-scale min-w-[200px]"
        >
          {isSubmitting ? "جاري التصحيح..." : "إرسال الإجابات والتحقق"}
        </button>
        <p className="text-xs text-tertiary">ملاحظة: يمكنك إعادة الاختبار أكثر من مرة إذا لم توفق.</p>
      </div>
    </div>
  );
}
