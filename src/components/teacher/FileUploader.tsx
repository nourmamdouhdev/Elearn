"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getPresignedUrlForUpload, createLessonContent } from "@/app/teacher/courses/actions";

interface FileUploaderProps {
  type: "VIDEO" | "PDF";
  courseId: string;
  lessonId: string;
  label: string;
  description: string;
  accept: string;
}

export function FileUploader({ type, courseId, lessonId, label, description, accept }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // 1. Get presigned URL
      const { uploadUrl, key, publicUrl } = await getPresignedUrlForUpload(file.name, file.type);

      // 2. Upload to S3/Supabase
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) resolve(true);
          else reject(new Error("فشل الرفع إلى الخادم"));
        };
        xhr.onerror = () => reject(new Error("حدث خطأ في الشبكة"));
        xhr.send(file);
      });

      // 3. Save to database
      const fileSizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
      await createLessonContent(courseId, lessonId, type, publicUrl, fileSizeMB);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex-col gap-sm w-full">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={accept} 
        onChange={handleUpload}
        disabled={isUploading}
      />
      
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`text-center py-xl bg-secondary rounded-md border-2 border-dashed transition-all cursor-pointer hover:border-primary group ${isUploading ? 'opacity-50 cursor-not-allowed' : 'border-border'}`}
      >
        {isUploading ? (
          <div className="flex-col items-center gap-md">
            <Loader2 size={40} className="animate-spin text-primary" />
            <div className="w-full max-w-xs bg-card rounded-full h-2 overflow-hidden mx-auto mt-sm">
              <div 
                className="bg-primary h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-secondary text-sm">جاري الرفع... {progress}%</p>
          </div>
        ) : success ? (
          <div className="flex-col items-center gap-sm">
            <CheckCircle2 size={48} className="text-success" />
            <p className="font-bold text-success">تم الرفع بنجاح!</p>
          </div>
        ) : (
          <div className="flex-col items-center gap-sm">
            <UploadCloud size={48} className="mx-auto mb-md text-tertiary group-hover:text-primary transition-colors" />
            <p className="mb-sm font-medium">{label}</p>
            <p className="text-sm text-tertiary">{description}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-sm text-error text-sm p-sm bg-error-glow/10 rounded-md border border-error/20 mt-sm">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
