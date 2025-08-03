import { useEffect, useState } from 'react';
import { useTranslator } from '../contexts/translator-context';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface BlogTranslatorProps {
  blogContent: string;
  title?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
];

export default function BlogTranslator({
  blogContent,
  title,
}: BlogTranslatorProps) {
  const {
    isTranslatorAvailable,
    isLanguageDetectorAvailable,
    detectLanguage,
    translateText,
    checkTranslationSupport,
    summarizeText,
    isLoading,
  } = useTranslator();

  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [selectedTargetLanguage, setSelectedTargetLanguage] =
    useState<string>('');
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [translationSupport, setTranslationSupport] = useState<
    'available' | 'unavailable'
  >('unavailable');

  // Auto-detect language when component mounts or content changes
  useEffect(() => {
    if (isLanguageDetectorAvailable && blogContent) {
      detectLanguage(blogContent).then(setDetectedLanguage);
    }
  }, [blogContent, isLanguageDetectorAvailable, detectLanguage]);

  // Check translation support when languages change
  useEffect(() => {
    if (
      detectedLanguage &&
      selectedTargetLanguage &&
      detectedLanguage !== selectedTargetLanguage
    ) {
      checkTranslationSupport(detectedLanguage, selectedTargetLanguage).then(
        setTranslationSupport
      );
    }
  }, [detectedLanguage, selectedTargetLanguage, checkTranslationSupport]);

  const handleTranslate = async () => {
    if (!detectedLanguage || !selectedTargetLanguage || !blogContent) return;

    setIsTranslating(true);
    try {
      const translation = await translateText(
        blogContent,
        detectedLanguage,
        selectedTargetLanguage
      );
      if (translation) {
        setTranslatedContent(translation);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSummarize = async () => {
    if (!blogContent) return;

    setIsSummarizing(true);
    try {
      const contentToSummarize = translatedContent || blogContent;
      const summaryResult = await summarizeText(contentToSummarize);
      if (summaryResult) {
        setSummary(summaryResult);
      }
    } catch (error) {
      console.error('Summarization failed:', error);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='text-center'>
          <p>Checking translation API availability...</p>
        </div>
      </Card>
    );
  }

  if (!isTranslatorAvailable && !isLanguageDetectorAvailable) {
    return (
      <Card className='p-6 border-red-200 bg-red-50'>
        <div className='text-red-700'>
          <h3 className='font-semibold mb-4'>Translation APIs Not Available</h3>

          <div className='space-y-4'>
            <div>
              <p className='text-sm mb-2'>
                Your browser doesn't support the Translation and Language
                Detection APIs. These features require a modern browser with
                experimental web platform features enabled.
              </p>

              <div className='bg-red-100 p-3 rounded text-xs space-y-2'>
                <p>
                  <strong>For Chrome:</strong>
                </p>
                <ol className='list-decimal list-inside space-y-1 ml-2'>
                  <li>
                    Go to <code>chrome://flags/</code>
                  </li>
                  <li>Search for "Experimental Web Platform features"</li>
                  <li>Enable it and restart Chrome</li>
                </ol>

                <p className='mt-3'>
                  <strong>For Chrome Canary:</strong>
                </p>
                <p className='ml-2'>Should work out of the box (recommended)</p>
              </div>
            </div>

            <div className='bg-yellow-50 border border-yellow-200 p-3 rounded'>
              <p className='text-yellow-800 text-sm'>
                <strong>Debug Info:</strong> Check the browser console for
                detailed API availability information.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className='bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700'>
              Reload Page After Enabling Flags
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Debug Information */}
      <Card className='p-4 border-blue-200 bg-blue-50'>
        <h3 className='font-semibold mb-3 text-blue-800'>Debug Information</h3>
        <div className='text-xs space-y-2 text-blue-700'>
          <p>
            <strong>Browser:</strong> {navigator.userAgent}
          </p>
          <p>
            <strong>Chrome Detected:</strong>{' '}
            {navigator.userAgent.includes('Chrome') ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>APIs in Window:</strong>{' '}
            {[
              'Translator' in window ? 'Translator' : null,
              'LanguageDetector' in window ? 'LanguageDetector' : null,
              'Summarizer' in window ? 'Summarizer' : null,
            ]
              .filter(Boolean)
              .join(', ') || 'None detected'}
          </p>
          <button
            onClick={() => {
              console.log('Window object keys:', Object.keys(window));
              console.log('Translator:', window.Translator);
              console.log('LanguageDetector:', window.LanguageDetector);
              console.log('Summarizer:', window.Summarizer);
            }}
            className='bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700'>
            Log Window APIs to Console
          </button>
        </div>
      </Card>

      {/* API Status */}
      <Card className='p-4'>
        <h3 className='font-semibold mb-3'>API Availability Status</h3>
        <div className='grid grid-cols-3 gap-4 text-sm'>
          <div
            className={`p-2 rounded ${
              isTranslatorAvailable
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
            <span className='font-medium'>Translator:</span>{' '}
            {isTranslatorAvailable ? '✓ Available' : '✗ Unavailable'}
          </div>
          <div
            className={`p-2 rounded ${
              isLanguageDetectorAvailable
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
            <span className='font-medium'>Language Detector:</span>{' '}
            {isLanguageDetectorAvailable ? '✓ Available' : '✗ Unavailable'}
          </div>
          <div className='p-2 rounded bg-blue-100 text-blue-700'>
            <span className='font-medium'>Detected Language:</span>{' '}
            {detectedLanguage || 'Unknown'}
          </div>
        </div>
      </Card>

      {/* Original Content */}
      <Card className='p-6'>
        <h3 className='font-semibold mb-3'>{title || 'Blog Content'}</h3>
        <div className='prose max-w-none'>
          <p className='whitespace-pre-wrap'>{blogContent}</p>
        </div>
      </Card>

      {/* Translation Controls */}
      {isTranslatorAvailable && detectedLanguage && (
        <Card className='p-6'>
          <h3 className='font-semibold mb-4'>Translation</h3>

          <div className='flex gap-4 mb-4'>
            <div className='flex-1'>
              <label className='block text-sm font-medium mb-2'>
                Translate to:
              </label>
              <select
                value={selectedTargetLanguage}
                onChange={(e) => setSelectedTargetLanguage(e.target.value)}
                className='w-full p-2 border rounded-md'>
                <option value=''>Select target language</option>
                {SUPPORTED_LANGUAGES.filter(
                  (lang) => lang.code !== detectedLanguage
                ).map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex flex-col justify-end'>
              <Button
                onClick={handleTranslate}
                disabled={
                  !selectedTargetLanguage ||
                  translationSupport === 'unavailable' ||
                  isTranslating
                }
                className='px-6'>
                {isTranslating ? 'Translating...' : 'Translate'}
              </Button>
              {selectedTargetLanguage && (
                <p
                  className={`text-xs mt-1 ${
                    translationSupport === 'available'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  {translationSupport === 'available'
                    ? 'Translation supported'
                    : 'Translation not supported'}
                </p>
              )}
            </div>
          </div>

          {translatedContent && (
            <div className='mt-4 p-4 bg-blue-50 rounded-md'>
              <h4 className='font-medium mb-2'>Translated Content:</h4>
              <p className='whitespace-pre-wrap'>{translatedContent}</p>
            </div>
          )}
        </Card>
      )}

      {/* Summarization */}
      <Card className='p-6'>
        <h3 className='font-semibold mb-4'>Content Summary</h3>

        <Button
          onClick={handleSummarize}
          disabled={isSummarizing || !blogContent}
          className='mb-4'>
          {isSummarizing ? 'Summarizing...' : 'Generate Summary'}
        </Button>

        {summary && (
          <div className='p-4 bg-yellow-50 rounded-md'>
            <h4 className='font-medium mb-2'>Summary:</h4>
            <p>{summary}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
