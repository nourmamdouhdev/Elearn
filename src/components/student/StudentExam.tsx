"use client";

import { useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, PlayCircle, Lock, AlertTriangle } from "lucide-react";
import { submitExamAttempt } from "@/app/(student)/lessons/actions";

interface StudentExamProps {
  lessonId: string;
  exam: any;
  studentId: string;
  attemptCount: number;
}

export function StudentExam({ lessonId, exam, studentId, attemptCount }: StudentExamProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [localAttemptCount, setLocalAttemptCount] = useState(attemptCount);

  const maxAttempts = exam.maxAttempts;
  const hasReachedLimit = maxAttempts !== null && maxAttempts !== undefined && localAttemptCount >= maxAttempts;
  const remainingAttempts = maxAttempts ? maxAttempts - localAttemptCount : null;

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
      setLocalAttemptCount(prev => prev + 1);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء إرسال الإجابات");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Max attempts reached — lockout screen
  if (hasReachedLimit && !result) {
    return (
      <div className="flex-col items-center justify-center py-2xl gap-lg text-center animate-fade-in">
        <div
          className="p-xl rounded-full mb-md"
          style={{ background: "rgba(255, 107, 107, 0.1)", color: "var(--error)" }}
        >
          <Lock size={64} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--error)" }}>
          تم استنفاد جميع المحاولات
        </h2>
        <p className="text-secondary" style={{ maxWidth: 400 }}>
          لقد استخدمت {localAttemptCount} من أصل {maxAttempts} محاولة متاحة.
          لا يمكنك إعادة الاختبار. يرجى التواصل مع المعلم للمساعدة.
        </p>
      </div>
    );
  }

  // Show result after submission
  if (result) {
    const newRemainingAttempts = maxAttempts ? maxAttempts - localAttemptCount : null;
    const canRetry = !result.passed && (newRemainingAttempts === null || newRemainingAttempts > 0);

    return (
      <div className="flex-col items-center justify-center py-2xl gap-lg text-center animate-fade-in">
        {result.passed ? (
          <>
            <div
              className="p-xl rounded-full mb-md"
              style={{ background: "rgba(0, 212, 170, 0.15)", color: "var(--success)" }}
            >
              <CheckCircle2 size={64} />
            </div>
            <h2 className="text-2xl font-bold">مبروك! لقد نجحت 🎉</h2>
            <p className="text-secondary">
              درجتك: {result.score.toFixed(0)}% (درجة النجاح المطلوب: {exam.passingScore}%)
            </p>
            <p className="text-secondary mb-xl">يمكنك الآن مشاهدة الحصة وتحميل المرفقات!</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary px-2xl py-md">
              <PlayCircle size={20} className="ml-xs" /> ابدأ مشاهدة الحصة الآن
            </button>
          </>
        ) : (
          <>
            <div
              className="p-xl rounded-full mb-md"
              style={{ background: "rgba(255, 107, 107, 0.15)", color: "var(--error)" }}
            >
              <XCircle size={64} />
            </div>
            <h2 className="text-2xl font-bold">للأسف، لم يحالفك الحظ</h2>
            <p className="text-secondary">
              درجتك: {result.score.toFixed(0)}% (درجة النجاح المطلوب: {exam.passingScore}%)
            </p>
            {canRetry ? (
              <>
                <p className="text-secondary mb-sm">حاول مراجعة المادة جيداً والبدء من جديد.</p>
                {newRemainingAttempts !== null && (
                  <p className="text-sm" style={{ color: "var(--warning)", fontWeight: 600 }}>
                    <AlertTriangle size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                    متبقي لك {newRemainingAttempts} محاولة فقط
                  </p>
                )}
                <button
                  onClick={() => { setResult(null); setAnswers({}); }}
                  className="btn btn-outline px-2xl py-md mt-md"
                >
                  إعادة المحاولة
                </button>
              </>
            ) : (
              <p className="text-secondary mb-xl" style={{ color: "var(--error)" }}>
                لقد استنفدت جميع محاولاتك ({maxAttempts} محاولة). يرجى التواصل مع المعلم.
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  // Exam form
  return (
    <div className="flex-col gap-2xl py-xl animate-fade-in">
      <div
        className="flex items-center gap-md p-lg rounded-xl"
        style={{
          background: "rgba(108, 99, 255, 0.05)",
          border: "1px solid rgba(108, 99, 255, 0.2)",
        }}
      >
        <div
          className="p-md rounded-lg"
          style={{ background: "rgba(108, 99, 255, 0.15)", color: "var(--primary)" }}
        >
          <ClipboardCheck size={32} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-xs">اختبار المتطلبات</h2>
          <p className="text-sm text-secondary">
            يجب عليك النجاح بنسبة {exam.passingScore}% لفتح محتوى هذه الحصة.
          </p>
        </div>
        {remainingAttempts !== null && (
          <div
            className="flex-col items-center p-md rounded-lg"
            style={{
              background: remainingAttempts <= 1 ? "rgba(255, 107, 107, 0.1)" : "rgba(108, 99, 255, 0.08)",
              minWidth: 80,
            }}
          >
            <span
              className="text-xl font-bold"
              style={{ color: remainingAttempts <= 1 ? "var(--error)" : "var(--primary)" }}
            >
              {remainingAttempts}
            </span>
            <span className="text-xs text-tertiary">محاولة متبقية</span>
          </div>
        )}
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
        {remainingAttempts !== null ? (
          <p className="text-xs text-tertiary">
            هذه المحاولة {localAttemptCount + 1} من أصل {maxAttempts}
          </p>
        ) : (
          <p className="text-xs text-tertiary">ملاحظة: يمكنك إعادة الاختبار أكثر من مرة إذا لم توفق.</p>
        )}
      </div>
    </div>
  );
}
