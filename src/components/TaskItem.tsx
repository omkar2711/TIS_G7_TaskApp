import React, { useState, useRef, useEffect } from 'react';
import { Check, Trash2, Edit3, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newText: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.text) {
      onEditTask(task.id, trimmed);
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const priorityColorClass =
    task.priority === 'high'
      ? 'text-rose-600 bg-rose-50/70 border-rose-200'
      : task.priority === 'low'
      ? 'text-emerald-600 bg-emerald-50/70 border-emerald-200'
      : 'text-amber-600 bg-amber-50/70 border-amber-200';

  const timeFormatted = new Date(task.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.18 }}
      className={`group flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border transition-all ${
        task.completed
          ? 'bg-slate-50/50 border-slate-200/50 text-slate-400'
          : 'bg-white border-slate-200/90 text-slate-800 shadow-xs hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Left Section: Complete Checkbox + Text Content */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`flex items-center justify-center w-5 h-5 rounded-md border transition-all shrink-0 cursor-pointer ${
            task.completed
              ? 'bg-slate-900 border-slate-900 text-white'
              : 'border-slate-300 bg-white hover:border-slate-600 text-transparent hover:text-slate-300'
          }`}
          aria-label={task.completed ? 'Mark task as pending' : 'Mark task as completed'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-slate-900"
              maxLength={180}
            />
            <button
              type="button"
              onClick={handleSaveEdit}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Save changes"
              aria-label="Save changes"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditText(task.text);
                setIsEditing(false);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Cancel editing"
              aria-label="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col flex-1 min-w-0 cursor-pointer select-none"
            onDoubleClick={() => setIsEditing(true)}
          >
            <span
              className={`text-sm sm:text-base font-normal leading-relaxed break-words transition-all ${
                task.completed
                  ? 'line-through text-slate-400'
                  : 'text-slate-800'
              }`}
            >
              {task.text}
            </span>

            {/* Subtle metadata tags adhering to zero-pill rule for static info */}
            <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-slate-400">
              {task.category && <span>{task.category}</span>}
              {task.category && <span aria-hidden="true">·</span>}
              {task.priority && (
                <span className={`capitalize font-medium ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                  {task.priority} priority
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-slate-400">{timeFormatted}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Priority Pill (desktop) & Action Buttons */}
      {!isEditing && (
        <div className="flex items-center gap-2 shrink-0">
          {task.priority && !task.completed && (
            <span className={`hidden md:inline-block text-[11px] px-2 py-0.5 rounded-md border capitalize font-medium ${priorityColorClass}`}>
              {task.priority}
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
              title="Edit task"
              aria-label={`Edit task: ${task.text}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
              title="Delete task"
              aria-label={`Delete task: ${task.text}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.li>
  );
};
