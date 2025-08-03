import { useState } from 'react';
import { useTranslator } from '../contexts/translator-context';

export function useBlogTranslation() {
  const {
    isTranslatorAvailable,
    isLanguageDetectorAvailable,
    detectLanguage,
    translateText,
    checkTranslationSupport,
    summarizeText,
  } = useTranslator();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectContentLanguage = async (content: string) => {
    if (!isLanguageDetectorAvailable) {
      setError('Language detection is not available in this browser');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const language = await detectLanguage(content);
      if (!language) {
        setError('Could not detect language of the content');
      }
      return language;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to detect language'
      );
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const translateContent = async (
    content: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => {
    if (!isTranslatorAvailable) {
      setError('Translation is not available in this browser');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // First check if translation is supported
      const support = await checkTranslationSupport(
        sourceLanguage,
        targetLanguage
      );
      if (support === 'unavailable') {
        setError(
          `Translation from ${sourceLanguage} to ${targetLanguage} is not supported`
        );
        return null;
      }

      const translation = await translateText(
        content,
        sourceLanguage,
        targetLanguage
      );
      if (!translation) {
        setError('Translation failed - no result returned');
      }
      return translation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const summarizeContent = async (content: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const summary = await summarizeText(content);
      if (!summary) {
        setError('Summarization failed - no result returned');
      }
      return summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summarization failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => setError(null);

  return {
    // API availability
    isTranslatorAvailable,
    isLanguageDetectorAvailable,

    // Functions
    detectContentLanguage,
    translateContent,
    summarizeContent,
    checkTranslationSupport,

    // State
    isProcessing,
    error,
    clearError,
  };
}
