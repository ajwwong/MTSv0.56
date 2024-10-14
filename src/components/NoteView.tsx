import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Note } from '../App';

interface NoteViewProps {
  notes: Note[];
}

const NoteView: React.FC<NoteViewProps> = ({ notes }) => {
  const { id } = useParams<{ id: string }>();
  const note = notes.find(n => n.id === id);

  if (!note) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Note not found</h2>
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          Go back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <Link to="/" className="flex items-center text-blue-500 hover:text-blue-700 mb-4">
        <ArrowLeft className="mr-2" size={20} />
        Back to Home
      </Link>
      <h2 className="text-2xl font-bold mb-2">{note.name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        {new Date(note.timestamp).toLocaleString()}
      </p>
      <div className="whitespace-pre-wrap">{note.content}</div>
    </div>
  );
};

export default NoteView;