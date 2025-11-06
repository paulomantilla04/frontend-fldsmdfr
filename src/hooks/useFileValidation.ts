import { useState } from 'react';

export interface FileValidationConfig {
  maxSize?: number;
  maxFiles?: number;
  allowedTypes?: string[];
}

export interface FileValidationError {
  file: string;
  error: string;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_FILES = 5;
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain'
];

export const useFileValidation = (config: FileValidationConfig = {}) => {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    maxFiles = DEFAULT_MAX_FILES,
    allowedTypes = DEFAULT_ALLOWED_TYPES
  } = config;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FileValidationError[]>([]);

  const addFiles = (newFiles: File[]): boolean => {
    setErrors([]);
    const validationErrors: FileValidationError[] = [];
    const validFiles: File[] = [];

    if (selectedFiles.length + newFiles.length > maxFiles) {
      setErrors([{
        file: 'general',
        error: `Solo puedes subir un máximo de ${maxFiles} archivos`
      }]);
      return false;
    }

    newFiles.forEach(file => {

      if (file.size > maxSize) {
        validationErrors.push({
          file: file.name,
          error: `El archivo es demasiado grande (máx ${formatFileSize(maxSize)})`
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        validationErrors.push({
          file: file.name,
          error: 'Tipo de archivo no permitido'
        });
        return;
      }

      if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        validationErrors.push({
          file: file.name,
          error: 'Este archivo ya está seleccionado'
        });
        return;
      }

      validFiles.push(file);
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    return true;
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setErrors([]);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setErrors([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getGeneralError = (): string | null => {
    const generalError = errors.find(e => e.file === 'general');
    return generalError ? generalError.error : null;
  };

  const getFileErrors = (): FileValidationError[] => {
    return errors.filter(e => e.file !== 'general');
  };

  return {
    selectedFiles,
    errors,
    addFiles,
    removeFile,
    clearFiles,
    formatFileSize,
    getGeneralError,
    getFileErrors,
    hasErrors: errors.length > 0
  };
};
