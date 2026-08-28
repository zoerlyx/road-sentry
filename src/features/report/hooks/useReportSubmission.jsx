import { useState, useCallback } from 'react';
import { reportService } from '../services/report.service';
import { validateReport } from '../validations/report.schema';

export const useReportSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const submitReport = useCallback(async (data, options = {}) => {
    setIsSubmitting(true);
    setError(null);
    setErrorType(null);
    setValidationErrors({});
    setIsSuccess(false);

    // 1. Client-side Validation
    if (typeof validateReport === 'function') {
      const validation = validateReport(data);
      if (!validation.isValid) {
        setValidationErrors(validation.errors || {});
        const firstErrorMsg =
          Object.values(validation.errors || {})[0] || 'Data laporan tidak valid';
        
        setError(firstErrorMsg);
        setIsSubmitting(false);

        const valError = new Error(firstErrorMsg);
        options.onError?.(valError);
        throw valError;
      }
    }

    // 2. Kirim ke Service
    try {
      const response = await reportService.submitReport(data);
      setIsSuccess(true);
      options.onSuccess?.(response);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Gagal mengirim laporan';
      const type = err.error_type || 'UNKNOWN_ERROR';

      setError(errorMessage);
      setErrorType(type);
      options.onError?.(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setError(null);
    setErrorType(null);
    setValidationErrors({});
    setIsSuccess(false);
    setIsSubmitting(false);
  }, []);

  return {
    submitReport,
    isSubmitting,
    error,
    errorType,
    validationErrors,
    isSuccess,
    resetState
  };
};