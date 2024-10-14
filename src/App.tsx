import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import NoteView from './components/NoteView';

export interface Note {
  id: string;
  name: string;
  content: string;
  timestamp: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  const addNote = (note: Note) => {
    setNotes(prevNotes => [...prevNotes, note]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">My Therapy Scribe</h1>
          <Routes>
            <Route path="/" element={<HomePage notes={notes} addNote={addNote} />} />
            <Route path="/note/:id" element={<NoteView notes={notes} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;