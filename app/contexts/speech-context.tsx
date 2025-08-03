import { useQueryState } from 'nuqs';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type SpeechSynthesisContext = {
  voices: SpeechSynthesisVoice[];
  onChangeVoices: Dispatch<SetStateAction<SpeechSynthesisVoice[]>>;
  speechSynthesisSupported: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  onChangeVoice: (voice: SpeechSynthesisVoice) => void;
  isSpeaking: boolean;
  onStartSpeaking: (text: string) => void;
  onStopSpeaking: () => void;
  isTransition: boolean;
};

const SpeechSynthesisContext = createContext({} as SpeechSynthesisContext);

export default function SpeechSynthesisContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isTransition, startTransition] = useTransition();

  const [lang, setLang] = useQueryState('lang', {
    // defaultValue: 'en-US',
    history: 'replace',
    throttleMs: 300,
    scroll: false,
    shallow: true,
    startTransition,
  });

  // Check for speech synthesis support on mount
  useEffect(() => {
    setSpeechSynthesisSupported(
      typeof window !== 'undefined' && !!window.speechSynthesis
    );
    window.speechSynthesis?.cancel();
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Load voices when available
  useEffect(() => {
    const handleVoicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      handleVoicesChanged
    );
    handleVoicesChanged(); // Initial load

    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged
      );
    };
  }, []);

  // Set the default voice if available
  useEffect(() => {
    if (voices.length > 0) {
      const defaultVoice = voices.find((v) => v.default);
      setSelectedVoice(defaultVoice || voices[0]);
    }
  }, [voices]);

  function handleChangeVoice(voice: SpeechSynthesisVoice) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    if (voices.includes(voice)) {
      setSelectedVoice(voice);
      setLang(voice.lang);
    } else {
      console.warn(
        'Selected voice is not available in the current voices list.'
      );
    }
  }

  // Helper to select the best available voice
  function getPreferredVoice() {
    if (!window.speechSynthesis) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Filter voices by the selected language
    const filteredVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith(lang!.toLowerCase())
    );

    if (filteredVoices.length > 0) {
      // Try to find a preferred voice by name or lang
      for (const voice of filteredVoices) {
        if (
          voice.name === selectedVoice?.name ||
          voice.lang === selectedVoice?.lang
        ) {
          return voice;
        }
      }
      // Fallback: return the first available voice in the filtered list
      return filteredVoices[0];
    }

    // Try to find a preferred voice by name or lang

    // const voices = window.speechSynthesis.getVoices();
    // if (!voices || voices.length === 0) return null;
    // // Try to find a preferred voice by name or lang
    // for (const pref of voices) {
    //   const byName = voices.find((v) => v.name === pref.name);
    //   if (byName) return byName;
    //   const byLang = voices.find((v) => v.lang === pref.name);
    //   if (byLang) return byLang;
    // }

    // for (const pref of preferredVoices) {
    //   const byName = voices.find((v) => v.name === pref);
    //   if (byName) return byName;
    //   const byLang = voices.find((v) => v.lang === pref);
    //   if (byLang) return byLang;
    // }
    // // Fallback: any en-US voice
    // const enVoice = voices.find(
    //   (v) => v.lang && v.lang.toLowerCase().startsWith('en-us')
    // );
    // if (enVoice) return enVoice;
    // Fallback: first available
    return voices[0];
  }

  // Start reading the text aloud
  function handleStartSpeaking(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new window.SpeechSynthesisUtterance(text);
    // Set preferred voice if available
    const voice = getPreferredVoice();
    console.log('Selected voice:', voice);
    if (voice) utterance.voice = voice;
    utterance.pitch = 1.25;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  // Stop reading aloud
  function handleStopSpeaking() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  const values = {
    voices,
    onChangeVoices: setVoices,
    speechSynthesisSupported,
    selectedVoice,
    onChangeVoice: handleChangeVoice,
    isSpeaking,
    onStartSpeaking: handleStartSpeaking,
    onStopSpeaking: handleStopSpeaking,
    isTransition,
  };

  return (
    <SpeechSynthesisContext.Provider value={values}>
      {children}
    </SpeechSynthesisContext.Provider>
  );
}

export function useSpeechSynthesis(text: string = '') {
  const context = useContext(SpeechSynthesisContext);
  if (!context) {
    throw new Error(
      'useSpeechSynthesis must be used within a SpeechSynthesisContextProvider'
    );
  }
  return context;
}
