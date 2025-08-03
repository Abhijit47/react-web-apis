import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function APITester() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const testApis = async () => {
    setIsTesting(true);
    setTestResults([]);

    addResult('Starting API tests...');

    // Test window object
    addResult(
      `Window keys found: ${
        Object.keys(window)
          .filter((key) =>
            ['Translator', 'LanguageDetector', 'Summarizer'].includes(key)
          )
          .join(', ') || 'None'
      }`
    );

    // Test Translator
    if ('Translator' in window) {
      try {
        addResult('Testing Translator.availability...');
        const availability = await window.Translator.availability({
          sourceLanguage: 'en',
          targetLanguage: 'es',
        });
        addResult(`Translator availability test: ${availability}`);

        if (availability === 'available') {
          addResult('Testing Translator.create...');
          const translator = await window.Translator.create({
            sourceLanguage: 'en',
            targetLanguage: 'es',
          });
          addResult('Translator created successfully');

          addResult('Testing translation...');
          const result = await translator.translate('Hello world');
          addResult(`Translation result: ${result}`);
        }
      } catch (error) {
        addResult(
          `Translator error: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else {
      addResult('Translator not found in window object');
    }

    // Test LanguageDetector
    if ('LanguageDetector' in window) {
      try {
        addResult('Testing LanguageDetector.create...');
        const detector = await window.LanguageDetector.create({});
        addResult('LanguageDetector created successfully');

        addResult('Testing language detection...');
        const result = await detector.detect('Hello world');
        addResult(`Detection result: ${JSON.stringify(result)}`);
      } catch (error) {
        addResult(
          `LanguageDetector error: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else {
      addResult('LanguageDetector not found in window object');
    }

    // Test Summarizer
    if ('Summarizer' in window) {
      try {
        addResult('Testing Summarizer.create...');
        const summarizer = await window.Summarizer.create({});
        addResult('Summarizer created successfully');

        addResult('Testing summarization...');
        const result = await summarizer.summarize(
          'This is a long text that needs to be summarized for testing purposes.'
        );
        addResult(`Summary result: ${result}`);
      } catch (error) {
        addResult(
          `Summarizer error: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else {
      addResult('Summarizer not found in window object');
    }

    addResult('API tests completed');
    setIsTesting(false);
    console.log('API test results:', testResults);
  };

  return (
    <Card className='p-6'>
      <h3 className='font-semibold mb-4'>API Tester</h3>

      <div className='space-y-4'>
        <Button onClick={testApis} disabled={isTesting} className='w-full'>
          {isTesting ? 'Testing APIs...' : 'Run API Tests'}
        </Button>

        {testResults.length > 0 && (
          <div className='bg-gray-50 p-4 rounded max-h-96 overflow-y-auto'>
            <h4 className='font-medium mb-2'>Test Results:</h4>
            <div className='text-xs space-y-1 font-mono'>
              {testResults.map((result, index) => (
                <div key={index} className='border-b border-gray-200 pb-1'>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='bg-yellow-50 border border-yellow-200 p-3 rounded text-sm'>
          <p className='font-medium text-yellow-800 mb-1'>Instructions:</p>
          <ol className='text-yellow-700 text-xs space-y-1 list-decimal list-inside'>
            <li>
              Enable "Experimental Web Platform features" in chrome://flags/
            </li>
            <li>Restart Chrome completely</li>
            <li>Reload this page</li>
            <li>Run the API tests to see detailed results</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
