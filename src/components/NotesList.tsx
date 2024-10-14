import React from 'react';
import { Link } from 'react-router-dom';
import { Note } from '../App';

interface NotesListProps {
  notes: Note[];
}

const NotesList: React.FC<NotesListProps> = ({ notes }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="bg-gray-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-1">{note.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{formatTimestamp(note.timestamp)}</p>
          <Link
            to={`/note/${note.id}`}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            View Note
          </Link>
        </div>
      ))}
    </div>
  );
};

export default NotesList;