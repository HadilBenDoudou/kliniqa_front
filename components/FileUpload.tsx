import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  id: string;
  label: string;
  file: File | null;
  accept: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: () => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  file,
  accept,
  onFileChange,
  onDrop,
  onRemove,
  error,
}) => (
  <div className="space-y-2">
    <label className="block">{label}</label>
    {file && (
      <div className="flex justify-center items-center mb-4 space-x-4">
        {file.type.startsWith("image/") ? (
          <img
            src={URL.createObjectURL(file)}
            alt={`${label} preview`}
            className="h-24 w-24 object-cover rounded border"
          />
        ) : (
          <div className="flex items-center space-x-2">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-sm text-gray-600">{file.name}</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )}
    <div
      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFileChange}
      />
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center w-full h-full text-gray-600"
      >
        <svg
          className="w-8 h-8 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16V8m0 0l-3 3m3-3l3 3m6-7v12m0 0l-3-3m3 3l3-3"
          />
        </svg>
        <span>Drag & drop {accept.includes("pdf") ? "an image or PDF" : "an image"} here or click to select</span>
      </label>
    </div>
    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
  </div>
);