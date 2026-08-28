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

};