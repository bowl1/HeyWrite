import React, { useRef, useState } from "react";
import { Button } from "./ui/button";

type UploadCardProps = {
  pdfFile: File | null;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
  uploading: boolean;
  uploadMsg: string;
  onRemove: () => void;
};

const UploadCard = ({
  pdfFile,
  onFileChange,
  onUpload,
  uploading,
  uploadMsg,
  onRemove,
}: UploadCardProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    ) {
      onFileChange(file);
    } else {
      onFileChange(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0] || null;
    handleFile(file);
  };

  return (
    <div
      className={`rounded-2xl border border-dashed ${
        isDragOver
          ? "border-blue-400 bg-blue-50"
          : "border-blue-200 bg-white/70"
      } p-4 shadow-inner transition`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow">
            📄
          </span>
          <div className="flex flex-col">
            <span>Upload a PDF to ground answers</span>
            <span className="text-xs font-normal text-slate-500">
              Drag & drop or choose a PDF. The more relevant the PDF, the better
              the answer.
            </span>
          </div>
        </div>
        {pdfFile && (
          <div className="inline-flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 shadow-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
              {pdfFile.name.slice(0, 2).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[12px] font-bold text-slate-600 shadow hover:bg-slate-100"
              aria-label="Remove PDF"
            >
              ×
            </button>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          handleFile(file);
        }}
        className="hidden"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={triggerFileSelect} variant="secondary" size="sm">
          Choose file
        </Button>
        <Button onClick={onUpload} disabled={uploading || !pdfFile} size="sm">
          {uploading ? "Uploading & Indexing..." : "Upload & Index"}
        </Button>
        {uploadMsg && (
          <div className="max-w-full break-words text-xs text-slate-600">
            {uploadMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCard;
