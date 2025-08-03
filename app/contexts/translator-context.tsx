import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

declare global {
  interface Window {
    Translator: {
      create: (languages: {
        sourceLanguage: string;
        targetLanguage: string;
        monitor?: (monitor: any) => void;
      }) => Promise<any>;
      availability: (languages: {
        sourceLanguage: string;
        targetLanguage: string;
      }) => Promise<'available' | 'unavailable' | 'downloadable'>;
    };
    LanguageDetector: {
      create: (options: {
        expectedInputLanguages?: string[];
        monitor?: (monitor: any) => void;
      }) => Promise<any>;
    };
    Summarizer: {
      create: (options: {
        sharedContext?: string;
        monitor?: (monitor: {
          CreateMonitor: {
            ondownloadprogress: number | null;
          };
        }) => void;
      }) => Promise<any>;
    };
  }
}

interface TranslatorContextType {
  isTranslatorAvailable: boolean;
  isLanguageDetectorAvailable: boolean;
  isSummarizerAvailable: boolean;
  detectLanguage: (text: string) => Promise<string | null>;
  translateText: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ) => Promise<string | null>;
  checkTranslationSupport: (
    sourceLanguage: string,
    targetLanguage: string
  ) => Promise<'available' | 'unavailable'>;
  summarizeText: (text: string) => Promise<string | null>;
  isLoading: boolean;
}

const TranslatorContext = createContext<TranslatorContextType>({
  isTranslatorAvailable: false,
  isLanguageDetectorAvailable: false,
  isSummarizerAvailable: false,
  detectLanguage: async () => null,
  translateText: async () => null,
  checkTranslationSupport: async () => 'unavailable',
  summarizeText: async () => null,
  isLoading: true,
});

export default function TranslatorContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isTranslatorAvailable, setIsTranslatorAvailable] = useState(false);
  const [isLanguageDetectorAvailable, setIsLanguageDetectorAvailable] =
    useState(false);
  const [isSummarizerAvailable, setIsSummarizerAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check API availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        console.log('Checking API availability...');
        console.log('Window object keys:', Object.keys(window));

        // Check if Translator API is available
        const translatorAvailable =
          'Translator' in window &&
          window.Translator &&
          typeof window.Translator.create === 'function' &&
          typeof window.Translator.availability === 'function';

        console.log('Translator check:', {
          inWindow: 'Translator' in window,
          exists: !!window.Translator,
          typeofTranslator: typeof window.Translator,
          hasCreate:
            window.Translator && typeof window.Translator.create === 'function',
          hasAvailability:
            window.Translator &&
            typeof window.Translator.availability === 'function',
          final: translatorAvailable,
        });

        setIsTranslatorAvailable(translatorAvailable);

        // Check if LanguageDetector API is available
        const languageDetectorAvailable =
          'LanguageDetector' in window &&
          window.LanguageDetector &&
          typeof window.LanguageDetector.create === 'function';

        console.log('LanguageDetector check:', {
          inWindow: 'LanguageDetector' in window,
          exists: !!window.LanguageDetector,
          typeofLanguageDetector: typeof window.LanguageDetector,
          hasCreate:
            window.LanguageDetector &&
            typeof window.LanguageDetector.create === 'function',
          final: languageDetectorAvailable,
        });

        setIsLanguageDetectorAvailable(languageDetectorAvailable);

        // Check if Summarizer API is available
        const summarizerAvailable =
          'Summarizer' in window &&
          window.Summarizer &&
          typeof window.Summarizer.create === 'function';

        console.log('Summarizer check:', {
          inWindow: 'Summarizer' in window,
          exists: !!window.Summarizer,
          typeofSummarizer: typeof window.Summarizer,
          hasCreate:
            window.Summarizer && typeof window.Summarizer.create === 'function',
          final: summarizerAvailable,
        });

        setIsSummarizerAvailable(summarizerAvailable);

        console.log('Final API Availability:', {
          translator: translatorAvailable,
          languageDetector: languageDetectorAvailable,
          summarizer: summarizerAvailable,
        });

        // Additional browser info for debugging
        console.log('Browser info:', {
          userAgent: navigator.userAgent,
          isChrome: navigator.userAgent.includes('Chrome'),
          isCanary:
            navigator.userAgent.includes('Chrome') &&
            navigator.userAgent.includes('dev'),
        });

        // Try to actually test the APIs by creating them
        if (translatorAvailable) {
          try {
            console.log('Testing Translator API...');
            const testAvailability = await window.Translator.availability({
              sourceLanguage: 'en',
              targetLanguage: 'es',
            });
            console.log('Translator test result:', testAvailability);
          } catch (error) {
            console.warn('Translator API test failed:', error);
            setIsTranslatorAvailable(false);
          }
        }

        if (languageDetectorAvailable) {
          try {
            console.log('Testing LanguageDetector API...');
            const detector = await window.LanguageDetector.create({});
            console.log('LanguageDetector test successful');
          } catch (error) {
            console.warn('LanguageDetector API test failed:', error);
            setIsLanguageDetectorAvailable(false);
          }
        }

        if (summarizerAvailable) {
          try {
            console.log('Testing Summarizer API...');
            const summarizer = await window.Summarizer.create({});
            console.log('Summarizer test successful');
          } catch (error) {
            console.warn('Summarizer API test failed:', error);
            setIsSummarizerAvailable(false);
          }
        }
      } catch (error) {
        console.error('Error checking API availability:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  // Detect language of given text
  const detectLanguage = async (text: string): Promise<string | null> => {
    if (!isLanguageDetectorAvailable) {
      console.warn('LanguageDetector API is not available');
      return null;
    }

    try {
      const detector = await window.LanguageDetector.create({
        expectedInputLanguages: [
          'en',
          'es',
          'fr',
          'de',
          'it',
          'pt',
          'zh',
          'ja',
          'ko',
          'ru',
          'ar',
          'hi',
          'bn',
        ],
      });

      const result = await detector.detect(text);

      // The API returns an array of detected languages with confidence scores
      // We want the one with the highest confidence (first item)
      if (Array.isArray(result) && result.length > 0) {
        return result[0].detectedLanguage || null;
      }

      // Fallback for older API format
      return result.detectedLanguage || null;
    } catch (error) {
      console.error('Error detecting language:', error);
      return null;
    }
  };

  // Check if translation is supported for given language pair
  const checkTranslationSupport = async (
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<'available' | 'unavailable'> => {
    if (!isTranslatorAvailable) {
      return 'unavailable';
    }

    try {
      const availability = await window.Translator.availability({
        sourceLanguage,
        targetLanguage,
      });

      // Handle both 'available' and 'downloadable' as valid states
      if (availability === 'available' || availability === 'downloadable') {
        return 'available';
      }

      return 'unavailable';
    } catch (error) {
      console.error('Error checking translation support:', error);
      return 'unavailable';
    }
  };

  // Translate text from source to target language
  const translateText = async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string | null> => {
    if (!isTranslatorAvailable) {
      console.warn('Translator API is not available');
      return null;
    }

    try {
      const availability = await checkTranslationSupport(
        sourceLanguage,
        targetLanguage
      );

      if (availability === 'unavailable') {
        console.log(
          `Translation not supported for ${sourceLanguage} to ${targetLanguage}`
        );
        return null;
      }

      const translator = await window.Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor: (monitor: any) => {
          monitor.addEventListener('downloadprogress', (e: any) => {
            console.log(
              `Translation model download: ${Math.floor(
                (e.loaded / e.total) * 100
              )}%`
            );
          });
        },
      });

      const translation = await translator.translate(text);
      return translation;
    } catch (error) {
      console.error('Error translating text:', error);
      return null;
    }
  };

  // Summarize text
  const summarizeText = async (text: string): Promise<string | null> => {
    if (!isSummarizerAvailable) {
      console.warn('Summarizer API is not available');
      return null;
    }

    try {
      const summarizer = await window.Summarizer.create({
        sharedContext:
          'A general summary to help a user decide if the text is worth reading',
        monitor: (monitor: any) => {
          monitor.addEventListener('downloadprogress', (e: any) => {
            console.log(
              `Summarizer model download: ${Math.floor(
                (e.loaded / e.total) * 100
              )}%`
            );
          });
        },
      });

      const summary = await summarizer.summarize(text);
      return summary;
    } catch (error) {
      console.error('Error summarizing text:', error);
      return null;
    }
  };

  const contextValue: TranslatorContextType = {
    isTranslatorAvailable,
    isLanguageDetectorAvailable,
    isSummarizerAvailable,
    detectLanguage,
    translateText,
    checkTranslationSupport,
    summarizeText,
    isLoading,
  };

  return (
    <TranslatorContext.Provider value={contextValue}>
      {children}
    </TranslatorContext.Provider>
  );
}

export function useTranslator() {
  const context = useContext(TranslatorContext);
  if (!context) {
    throw new Error(
      'useTranslator must be used within a TranslatorContextProvider'
    );
  }
  return context;
}
