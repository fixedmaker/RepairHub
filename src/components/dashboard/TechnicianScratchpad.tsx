import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  StickyNote, 
  CheckSquare, 
  Square, 
  FileText,
  CheckCircle2,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TechnicianScratchpadProps {
  userId: string | undefined;
}

export default function TechnicianScratchpad({ userId }: TechnicianScratchpadProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'todo'>('todo');
  
  // States for Notes
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  // States for Todo Checklist
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  // Key names based on current technician user ID to prevent data leakage
  const notesKey = userId ? `tech_notes_v1_${userId}` : 'tech_notes_v1_guest';
  const todoKey = userId ? `tech_todo_v1_${userId}` : 'tech_todo_v1_guest';

  // Load initial data
  useEffect(() => {
    const savedNotes = localStorage.getItem(notesKey);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes('');
    }

    const savedTodos = localStorage.getItem(todoKey);
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (e) {
        setTodos([]);
      }
    } else {
      // Default placeholder items for better user experience on first view
      const defaultTodos: TodoItem[] = [
        { id: '1', text: 'Periksa ketersediaan LCD Asus ROG di laci sparepart', completed: false, createdAt: new Date().toISOString() },
        { id: '2', text: 'Klaim garansi charger MacBook Air milik Budi', completed: true, createdAt: new Date().toISOString() },
        { id: '3', text: 'Catat PIN/Password unit pelanggan sebelum dibongkar', completed: false, createdAt: new Date().toISOString() }
      ];
      setTodos(defaultTodos);
      localStorage.setItem(todoKey, JSON.stringify(defaultTodos));
    }
  }, [userId, notesKey, todoKey]);

  // Handle Note storage auto-save
  useEffect(() => {
    if (notes === '') {
      setSaveStatus('idle');
      return;
    }
    
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem(notesKey, notes);
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [notes, notesKey]);

  // Handle Todo storage updates
  const saveTodos = (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    localStorage.setItem(todoKey, JSON.stringify(updatedTodos));
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updated = [newTodo, ...todos];
    saveTodos(updated);
    setNewTodoText('');
  };

  const handleToggleTodo = (id: string) => {
    const updated = todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    saveTodos(updated);
  };

  const clearCompletedTodos = () => {
    const updated = todos.filter(t => !t.completed);
    saveTodos(updated);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col min-h-[380px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-red-500" /> Buku Catatan Teknisi
        </h3>
        <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-extrabold flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" /> Pribadi
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 mb-4 p-0.5 bg-slate-50 rounded-xl">
        <button
          onClick={() => setActiveTab('todo')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === 'todo'
              ? "bg-white text-slate-800 shadow-sm border border-slate-100"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Agenda & Part ({todos.filter(t => !t.completed).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
            activeTab === 'notes'
              ? "bg-white text-slate-800 shadow-sm border border-slate-100"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Coretan Memo</span>
        </button>
      </div>

      {/* Todo Checklist Tab */}
      {activeTab === 'todo' && (
        <div className="flex-1 flex flex-col space-y-3">
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <input
              type="text"
              placeholder="Tambah pengingat / sparepart..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-100 text-xs rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400 font-sans"
            />
            <button
              type="submit"
              className="px-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-sm shadow-red-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* List */}
          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1 custom-scrollbar">
            {todos.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/40">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-[11px] font-bold text-slate-400">Semua agenda selesai!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={cn(
                      "flex items-start justify-between gap-2 p-2.5 rounded-xl border transition-all text-left",
                      todo.completed
                        ? "bg-slate-50/50 border-slate-100/60 opacity-60"
                        : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(todo.id)}
                      className="mt-0.5 shrink-0 transition-colors"
                    >
                      {todo.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-red-500" />
                      )}
                    </button>
                    
                    <span 
                      onClick={() => handleToggleTodo(todo.id)}
                      className={cn(
                        "flex-1 text-xs cursor-pointer font-medium select-none text-slate-700 leading-tight break-all font-sans",
                        todo.completed && "line-through text-slate-400"
                      )}
                    >
                      {todo.text}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-1 hover:bg-slate-50 rounded text-slate-300 hover:text-red-500 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {todos.some(t => t.completed) && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={clearCompletedTodos}
                className="text-[10px] text-slate-400 hover:text-red-500 font-bold flex items-center gap-1"
              >
                Bersihkan Tercentang
              </button>
            </div>
          )}
        </div>
      )}

      {/* Memo Scratchpad Tab */}
      {activeTab === 'notes' && (
        <div className="flex-1 flex flex-col space-y-2">
          <div className="relative flex-1">
            <textarea
              placeholder="Tulis coretan di sini... PIN unit, diagnosa sementara, garansi, dsb. Memo tersimpan otomatis pada perangkat ini."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-[220px] p-3.5 bg-yellow-50/40 border border-yellow-200/40 text-slate-700 placeholder:text-slate-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/10 focus:border-yellow-300/80 transition-all text-xs font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Autosave Indicator */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" /> Catatan Mandiri
            </span>
            <span>
              {saveStatus === 'saving' && 'Sedang menyimpan...'}
              {saveStatus === 'saved' && '✓ Memo Tersimpan'}
              {saveStatus === 'idle' && 'Siap menulis'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
