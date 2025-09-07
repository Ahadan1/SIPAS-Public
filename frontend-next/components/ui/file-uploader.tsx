'use client';

import { FileText, MousePointerSquareDashed, Trash2, UploadCloud } from 'lucide-react';
import React, { useCallback, useMemo, forwardRef } from 'react';
import { useDropzone, DropzoneState, DropzoneOptions } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const th = 'text-primary-500';
const tr = 'duration-300';
const border =
  'border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg';

export interface FileUploaderProps {
  value: File[];
  onValueChange: (value: File[]) => void;
  dropzoneOptions?: DropzoneOptions | null;
  reSelect?: boolean;
  className?: string;
}

export const FileUploader = React.forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    { value, onValueChange, dropzoneOptions = {}, reSelect = false, className, ...props },
    ref
  ) => {
    const onDrop = useCallback(
      (acceptedFiles: File[], rejectedFiles: any[]) => {
        if (!reSelect && value.length > 0) return;
        if (dropzoneOptions?.maxFiles && acceptedFiles.length > dropzoneOptions.maxFiles) {
          console.error(`Error: Cannot upload more than ${dropzoneOptions.maxFiles} files.`);
          return;
        }

        const newFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
        onValueChange(newFiles);
        if (rejectedFiles.length > 0) {
          console.error('Some files were rejected:', rejectedFiles);
        }
      },
      [dropzoneOptions, value, reSelect, onValueChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      ...dropzoneOptions,
    });

    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          'relative w-full',
          className
        )}
      >
        <div
          {...getRootProps({
            className: twMerge(
              `p-4 py-8 w-full rounded-xl flex justify-center items-center flex-col cursor-pointer`,
              isDragActive ? 'bg-muted-foreground/20' : '',
              border
            ),
          })}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-lg">Drop files here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
        </div>
      </div>
    );
  }
);
FileUploader.displayName = 'FileUploader';

interface FileUploaderContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FileUploaderContent = React.forwardRef<HTMLDivElement, FileUploaderContentProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props} className="flex flex-col gap-2">
        {children}
      </div>
    );
  }
);
FileUploaderContent.displayName = 'FileUploaderContent';

interface FileUploaderItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

export const FileUploaderItem = React.forwardRef<HTMLDivElement, FileUploaderItemProps>(
  ({ index, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className="relative flex items-center justify-between gap-2 p-2 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm">{children}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Add a trash icon to remove the file */}
          <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" onClick={() => {
            // Logic to remove file from the state
          }} />
        </div>
      </div>
    );
  }
);
FileUploaderItem.displayName = 'FileUploaderItem';

interface FileInputProps extends React.HTMLAttributes<HTMLDivElement> {
  dropzoneState: DropzoneState;
}

export const FileInput = React.forwardRef<HTMLDivElement, FileInputProps>(
  ({ dropzoneState, children, ...props }, ref) => {
    const { getRootProps, getInputProps, isDragActive } = dropzoneState;

    return (
      <div
        {...getRootProps()}
        className={twMerge(
          `p-4 py-8 w-full rounded-xl flex justify-center items-center flex-col cursor-pointer`,
          isDragActive ? 'bg-muted-foreground/20' : '',
          border
        )}
      >
        <input {...getInputProps()} />
        {children}
      </div>
    );
  }
);
FileInput.displayName = 'FileInput';