import type { CoordinatorNote } from '../../../types';
import { timeStamp } from '../../../utils/dateUtils';

interface NotesTabProps {
  notes: CoordinatorNote[];
  noteText: string;
  onNoteChange: (v: string) => void;
  onSubmit: () => void;
}

export default function NotesTab({ notes, noteText, onNoteChange, onSubmit }: NotesTabProps) {
  return (
    <div className="p-5 space-y-4">
      <div>
        <label htmlFor="note-input" className="block text-xs font-semibold text-slate-600 font-sans mb-1.5">
          Add coordinator note
        </label>
        <textarea
          id="note-input"
          value={noteText}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Document your action, observation, or follow-up…"
          rows={3}
          className="w-full text-sm font-sans border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition resize-none placeholder-slate-400 text-slate-800"
        />
        <button
          onClick={onSubmit}
          disabled={!noteText.trim()}
          className="mt-2 text-xs font-medium font-sans px-3.5 py-2 rounded-md bg-forest text-white hover:bg-forest-light transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1"
        >
          Save note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-slate-400 font-sans text-center py-6">No notes yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 font-sans">{note.coordinator_name}</span>
                <span className="text-xs text-slate-400 font-sans">{timeStamp(note.created_at)}</span>
              </div>
              <p className="text-sm text-slate-700 font-sans leading-relaxed">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
