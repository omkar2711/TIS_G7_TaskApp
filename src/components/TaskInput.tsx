import React, { useState, useRef } from 'react';
import { Plus, Flag, FolderPlus } from 'lucide-react';
import { Priority } from '../types';

interface TaskInputProps {
  onAddTask: (text: string, priority: Priority, category: string) => void;
  categories: string[];
}

export const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, categories }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('General');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    onAddTask(trimmed, priority, category);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {/* Input box */}
      <div>
        <label htmlFor="task-text-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Task Description
        </label>
        <div className="relative">
          <input
            id="task-text-input"
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-slate-800 focus:ring-2 focus:ring-slate-100 transition-all"
            maxLength={180}
            autoFocus
          />
        </div>
      </div>

      {/* Priority and Category controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Flag className="w-3 h-3 text-slate-400" />
            Priority
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => {
              const isActive = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1 text-xs font-medium capitalize rounded-md transition-all ${
                    isActive
                      ? p === 'high'
                        ? 'bg-rose-50 text-rose-700 shadow-xs font-semibold'
                        : p === 'medium'
                        ? 'bg-amber-50 text-amber-700 shadow-xs font-semibold'
                        : 'bg-emerald-50 text-emerald-700 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category-select" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <FolderPlus className="w-3 h-3 text-slate-400" />
            Category
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:border-slate-800 transition-all cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Task Button */}
      <button
        type="submit"
        disabled={!text.trim()}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
        aria-label="Add task"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Task</span>
      </button>
    </form>
  );
};
