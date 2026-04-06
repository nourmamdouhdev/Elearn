"use client";

import { useState, useRef } from "react";
import { ClipboardCheck, Plus, Trash2, CheckCircle2, Circle, Edit2, FileUp, Loader2 } from "lucide-react";
import { upsertExam, addQuestion, deleteQuestion, updateQuestion, importQuestions } from "@/app/teacher/courses/actions";
import * as XLSX from "xlsx";

interface AnswerOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface ExamManagerProps {
  lessonId: string;
  exam: any; // Simplified for now
}

export function ExamManager({ lessonId, exam }: ExamManagerProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [options, setOptions] = useState<AnswerOption[]>([
    { id: undefined, text: "", isCorrect: true },
    { id: undefined, text: "", isCorrect: false },
  ]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddOption = () => {
    setOptions([...options, { id: undefined, text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    // Ensure at least one is correct if we removed the correct one
    if (!newOptions.some(o => o.isCorrect)) {
      newOptions[0].isCorrect = true;
    }
    setOptions(newOptions);
  };

  const toggleCorrect = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam) {
      alert("يرجى حفظ إعدادات الامتحان أولاً");
      return;
    }
    
    const formData = new FormData();
    formData.append("questionText", newQuestionText);
    formData.append("options", JSON.stringify(options));
    
    if (editingQuestionId) {
      await updateQuestion(editingQuestionId, formData);
    } else {
      await addQuestion(exam.id, formData);
    }

    setIsAddingQuestion(false);
    setEditingQuestionId(null);
    setNewQuestionText("");
    setOptions([{ id: undefined, text: "", isCorrect: true }, { id: undefined, text: "", isCorrect: false }]);
  };

  const startEditing = (q: any) => {
    setEditingQuestionId(q.id);
    setIsAddingQuestion(true);
    setNewQuestionText(q.text);
    setOptions(q.options.map((opt: any) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.isCorrect
    })));
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !exam) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        // Skip header if it exists (check if first row looks like text headers)
        const startIndex = (typeof data[0]?.[0] === 'string' && data[0][0].includes('سؤال')) ? 1 : 0;
        
        const questionsToImport = data.slice(startIndex).filter(row => row[0]).map(row => {
          const text = String(row[0]);
          const opts = [];
          for (let i = 1; i <= 4; i++) {
            if (row[i]) opts.push({ text: String(row[i]), isCorrect: false });
          }
          
          // Determine correct answer
          const correctIndicator = row[5];
          if (typeof correctIndicator === 'number' && correctIndicator >= 1 && correctIndicator <= opts.length) {
            opts[correctIndicator - 1].isCorrect = true;
          } else if (correctIndicator) {
            const matchIndex = opts.findIndex(o => o.text.trim() === String(correctIndicator).trim());
            if (matchIndex !== -1) opts[matchIndex].isCorrect = true;
            else if (opts.length > 0) opts[0].isCorrect = true; // Fallback
          } else if (opts.length > 0) {
            opts[0].isCorrect = true; // Fallback
          }

          return { text, options: opts };
        });

        if (questionsToImport.length > 0) {
          await importQuestions(exam.id, questionsToImport);
          alert(`تم استيراد ${questionsToImport.length} سؤال بنجاح`);
        }
      } catch (err) {
        console.error(err);
        alert("فشل استيراد الملف. تأكد من التنسيق الصحيح.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="card flex-col gap-lg">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-sm"><ClipboardCheck size={20} className="text-secondary" /> اختبار المتطلبات (MCQ)</h3>
        <div className="flex gap-sm">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkImport} />
          <button 
            disabled={!exam || isImporting} 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost btn-sm gap-xs text-secondary"
          >
            {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />} 
            استيراد جماعي
          </button>
          {!exam && <span className="badge badge-warning">لم يتم إنشاء امتحان بعد</span>}
        </div>
      </div>

      {/* Exam Settings */}
      <form action={upsertExam.bind(null, lessonId)} className="flex-col gap-md p-md bg-secondary rounded-md border">
        <div className="grid grid-2 gap-md">
          <div className="form-group">
            <label className="form-label text-xs">نسبة النجاح (%)</label>
            <input name="passingScore" type="number" className="form-input" defaultValue={exam?.passingScore || 50} min="1" max="100" />
          </div>
          <div className="form-group">
            <label className="form-label text-xs">أقصى عدد محاولات (اتركه فارغاً للا نهائي)</label>
            <input name="maxAttempts" type="number" className="form-input" defaultValue={exam?.maxAttempts || ""} />
          </div>
        </div>
        <button type="submit" className="btn btn-secondary btn-sm w-fit mr-auto">حفظ إعدادات الامتحان</button>
      </form>

      {/* Questions List */}
      <div className="flex-col gap-md mt-md">
        {exam?.questions?.length === 0 && !isAddingQuestion && (
          <div className="text-center py-xl text-tertiary border-dashed" style={{ border: "2px dashed var(--border-color)" }}>
            لا توجد أسئلة حالياً. أضف سؤالاً لإجبار الطالب على حله قبل المشاهدة.
          </div>
        )}

        {exam?.questions?.map((q: any, idx: number) => (
          <div key={q.id} className="p-md border rounded-md bg-card flex-col gap-sm relative group">
            <div className="absolute top-2 left-2 flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => startEditing(q)}
                className="p-xs text-secondary hover-bg-secondary/10 rounded"
                title="تعديل"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => deleteQuestion(q.id)}
                className="p-xs text-error hover-bg-error/10 rounded"
                title="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="font-bold text-sm ml-xl">سؤال {idx + 1}: {q.text}</p>
            <div className="grid grid-2 gap-sm">
              {q.options.map((opt: any) => (
                <div key={opt.id} className={`p-xs rounded border text-xs flex items-center gap-sm ${opt.isCorrect ? 'border-success bg-success-glow/10' : 'border-border'}`}>
                  {opt.isCorrect ? <CheckCircle2 size={12} className="text-success" /> : <Circle size={12} className="text-tertiary" />}
                  {opt.text}
                </div>
              ))}
            </div>
          </div>
        ))}

        {isAddingQuestion ? (
          <form onSubmit={handleSaveQuestion} className="p-lg border-primary border bg-primary-glow/5 rounded-md flex-col gap-md">
            <div className="form-group">
              <label className="form-label">نص السؤال</label>
              <textarea 
                className="form-input" 
                rows={2} 
                value={newQuestionText} 
                onChange={(e) => setNewQuestionText(e.target.value)}
                required
              />
            </div>
            
            <div className="flex-col gap-sm">
              <label className="form-label text-xs">الاختيارات (حدد الاختيار الصحيح)</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-sm">
                  <button type="button" onClick={() => toggleCorrect(i)} className={`shrink-0 ${opt.isCorrect ? 'text-success' : 'text-tertiary'}`}>
                    {opt.isCorrect ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <input 
                    type="text" 
                    className="form-input flex-1" 
                    value={opt.text} 
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i].text = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`الاختيار ${i + 1}`}
                    required 
                  />
                  <button type="button" onClick={() => handleRemoveOption(i)} className="text-error p-xs hover-bg-error/10 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddOption} className="btn btn-ghost btn-sm w-fit gap-xs text-secondary mt-xs">
                <Plus size={14} /> إضافة اختيار آخر
              </button>
            </div>

            <div className="flex justify-end gap-md mt-md">
              <button type="button" onClick={() => {
                setIsAddingQuestion(false);
                setEditingQuestionId(null);
                setNewQuestionText("");
                setOptions([{ id: undefined, text: "", isCorrect: true }, { id: undefined, text: "", isCorrect: false }]);
              }} className="btn btn-ghost btn-sm">إلغاء</button>
              <button type="submit" className="btn btn-primary btn-sm">
                {editingQuestionId ? "تحديث السؤال" : "حفظ السؤال"}
              </button>
            </div>
          </form>
        ) : (
          exam && (
            <button onClick={() => setIsAddingQuestion(true)} className="btn btn-outline btn-sm w-full py-md border-dashed">
              <Plus size={18} /> إضافة سؤال جديد للمسابقة
            </button>
          )
        )}
      </div>
    </div>
  );
}
