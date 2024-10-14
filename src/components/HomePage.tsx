import React, { useState } from 'react';
import { Upload, UserPlus } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import TranscriptDisplay from './TranscriptDisplay';
import TherapistRecommendations from './TherapistRecommendations';
import NotesList from './NotesList';
import { transcribeAudio } from '../services/assemblyAI';
import { Note } from '../App';

interface HomePageProps {
  notes: Note[];
  addNote: (note: Note) => void;
}

interface Client {
  id: string;
  name: string;
}

const HomePage: React.FC<HomePageProps> = ({ notes, addNote }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [clientName, setClientName] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ]);
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  const handleStartRecording = () => {
    if (selectedClient) {
      setIsRecording(true);
      setError(null);
    } else {
      setError('Please select a client before starting the session.');
    }
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
      setShowNameInput(true);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setError(`An error occurred while processing the audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTranscript(null);
      setRecommendations(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = () => {
    if (recommendations && selectedClient) {
      const timestamp = new Date().toISOString();
      const newNote: Note = {
        id: Date.now().toString(),
        name: selectedClient.name,
        content: recommendations,
        timestamp
      };
      addNote(newNote);
      setShowNameInput(false);
      setSelectedClient(null);
      setAudioBlob(null);
      setTranscript(null);
      setRecommendations(null);
    }
  };

  const handleAddNewClient = () => {
    if (newClientName.trim()) {
      const newClient: Client = {
        id: Date.now().toString(),
        name: newClientName.trim()
      };
      setClients([...clients, newClient]);
      setSelectedClient(newClient);
      setNewClientName('');
      setShowNewClientInput(false);
    }
  };

  return (
    <div className="flex gap-8">
      <div className="w-1/4 bg-white p-6 rounded-lg shadow-lg overflow-y-auto max-h-[calc(100vh-200px)]">
        <h2 className="text-2xl font-bold mb-4">Previous Notes</h2>
        <NotesList notes={notes} />
      </div>
      <div className="w-3/4 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Therapy Session</h2>
        
        {!isRecording && !audioBlob && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Select Client</h3>
            <select
              value={selectedClient?.id || ''}
              onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value) || null)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2"
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            {!showNewClientInput ? (
              <button
                onClick={() => setShowNewClientInput(true)}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <UserPlus className="mr-2" size={20} />
                Add New Client
              </button>
            ) : (
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Enter new client name"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddNewClient}
                  className="px-4 py-2 border border-transparent text-base font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
        
        <AudioRecorder
          isRecording={isRecording}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
        />
        {audioBlob && (
          <button
            onClick={handleSubmit}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <Upload className="mr-2" size={20} />
                Generate Note
              </>
            )}
          </button>
        )}
        {error && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {recommendations && (
          <button
            onClick={handleSaveNote}
            className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Save Note
          </button>
        )}
        {transcript && <TranscriptDisplay transcript={transcript} />}
        {recommendations && <TherapistRecommendations recommendations={recommendations} />}
      </div>
    </div>
  );
};

export default HomePage;