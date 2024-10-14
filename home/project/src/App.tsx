import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import TranscriptDisplay from './components/TranscriptDisplay';
import TherapistRecommendations from './components/TherapistRecommendations';
import { transcribeAudio } from './services/assemblyAI';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);

  const handleStartRecording = () => {
    setIsRecording(true);
    setError(null);
  };

  const handleStopRecording = (blob: Blob) => {
    setIsRecording(false);
    setAudioBlob(blob);
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError('No audio recorded. Please record audio before submitting.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await transcribeAudio(audioBlob);
      setTranscript(result.transcript);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setError(`An error occurred while processing the audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTranscript(null);
      setRecommendations(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transcript) {
      console.log('Raw transcript:', transcript);

      // Create a formatted version of the transcript
      const formattedTranscript = transcript.utterances.map((utterance: any, index: number) => {
        return `Speaker ${utterance.speaker}: ${utterance.text}\n`;
      }).join('');

      console.log('Formatted transcript:', formattedTranscript);
    }
  }, [transcript]);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Psychodynamic Note Generator</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <AudioRecorder
                  isRecording={isRecording}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                />
                {audioBlob && (
                  <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Processing...'
                    ) : (
                      <>
                        <Upload className="mr-2" size={20} />
                        Generate Psychodynamic Note
                      </>
                    )}
                  </button>
                )}
                {error && (
                  <div className="text-red-500 text-sm mt-2">{error}</div>
                )}
              </div>
              {transcript && <TranscriptDisplay transcript={transcript} />}
              {recommendations && <TherapistRecommendations recommendations={recommendations} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;