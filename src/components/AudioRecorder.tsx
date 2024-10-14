import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, StopCircle, Pause, Play, X } from 'lucide-react';

interface AudioRecorderProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ isRecording, onStart, onStop }) => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const audioChunks = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(() => {
    onStart();
  }, [onStart]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }, [mediaRecorder]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  }, [mediaRecorder]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  }, [mediaRecorder]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setAudioStream(null);
      audioChunks.current = [];
      onStop(new Blob());
    }
  }, [mediaRecorder, onStop]);

  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          setAudioStream(stream);
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);

          recorder.ondataavailable = (e) => {
            audioChunks.current.push(e.data);
          };

          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
            onStop(audioBlob);
            audioChunks.current = [];
          };

          recorder.start();
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
          setError(`Microphone access error: ${error.message}`);
        });
    } else {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
    }
  }, [isRecording, onStop]);

  return (
    <div className="flex flex-col items-center">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors duration-300 w-full mb-4"
        >
          <Mic className="mr-2" size={20} />
          Start Session
        </button>
      ) : (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={stopRecording}
              className="flex items-center justify-center px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors duration-300"
            >
              <StopCircle className="mr-2" size={20} />
              End Session
            </button>
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full bg-red-500 ${isRecording && !isPaused ? 'animate-pulse' : ''}`}></div>
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </button>
              <button
                onClick={cancelRecording}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <canvas ref={canvasRef} width="300" height="60" className="w-full border border-gray-300 rounded-lg" />
        </div>
      )}
      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;