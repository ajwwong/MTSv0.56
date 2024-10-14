import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface TherapistRecommendationsProps {
  recommendations: string;
}

const TherapistRecommendations: React.FC<TherapistRecommendationsProps> = ({ recommendations }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recommendations);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Psychodynamic Note</h2>
        <button
          onClick={copyToClipboard}
          className={`flex items-center px-3 py-1 rounded ${
            copied ? 'bg-green-500' : 'bg-blue-500'
          } text-white hover:opacity-80 transition-colors duration-300`}
        >
          {copied ? (
            <>
              <Check size={16} className="mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Clipboard size={16} className="mr-1" />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-gray-700">{recommendations}</p>
    </div>
  );
};

export default TherapistRecommendations;