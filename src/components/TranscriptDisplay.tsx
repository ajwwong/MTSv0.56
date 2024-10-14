import React from 'react';

interface Utterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

interface TranscriptDisplayProps {
  transcript: {
    utterances: Utterance[];
    id: string;
    status: string;
    audio_url: string;
  };
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Transcript</h2>
      <p className="mb-2 text-gray-700"><strong>Transcript ID:</strong> {transcript.id}</p>
      <p className="mb-4 text-gray-700"><strong>Status:</strong> {transcript.status}</p>
      {transcript.utterances.map((utterance, index) => (
        <div key={index} className="mb-4">
          <span className="font-semibold text-blue-600">Speaker {utterance.speaker}:</span>
          <p className="mt-1 text-gray-700">{utterance.text}</p>
          <p className="text-sm text-gray-500">
            Time: {(utterance.start / 1000).toFixed(2)}s - {(utterance.end / 1000).toFixed(2)}s
          </p>
        </div>
      ))}
    </div>
  );
};

export default TranscriptDisplay;