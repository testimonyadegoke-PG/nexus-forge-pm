import React from 'react';

export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFiles, multiple = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFiles(Array.from(e.target.files));
    }
  };
  return (
    <div className="my-2">
      <input
        type="file"
        multiple={multiple}
        onChange={handleChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        aria-label="File Upload"
      />
    </div>
  );
};
