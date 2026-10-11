/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Calendar,
  CheckCheck,
  Search,
  Sparkles,
  Trash2,
  RotateCcw,
  ArrowUpDown,
  Filter,
  Check,
  Folder,
} from 'lucide-react';
import { Task, Priority, FilterType } from './types';
import { TaskInput } from './components/TaskInput';
import { TaskItem } from './components/TaskItem';
import { EmptyState } from './components/EmptyState';

const STORAGE_KEY = 'taskflow_landscape_tasks_v1';
const CATEGORIES = ['General', 'Work', 'Personal', 'Errands', 'Health'];

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    text: 'Draft project kickoff plan and key deliverables',
    completed: false,
    priority: 'high',
    category: 'Work',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: '2',
    text: 'Review pull request from design system team',
    completed: true,
    priority: 'medium',
    category: 'Work',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: '3',
    text: 'Pick up groceries for dinner (olive oil, basil, pasta)',
    completed: false,
    priority: 'low',
    category: 'Errands',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: '4',
    text: 'Schedule 30-minute afternoon walk and hydration break',
    completed: false,
    priority: 'low',
    category: 'Health',
    createdAt: Date.now() - 1800000,
  },
];

type SortOption = 'newest' | 'oldest' | 'priority';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_TASKS;
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastDeletedTask, setLastDeletedTask] = useState<{ task: Task; index: number } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }, [tasks]);

  // Dismiss undo notification after 6 seconds
  useEffect(() => {
    if (!lastDeletedTask) return;
    const timer = setTimeout(() => {
      setLastDeletedTask(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [lastDeletedTask]);

  const handleAddTask = (text: string, priority: Priority, category: string) => {
    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return;
    const taskToDelete = tasks[index];
    setLastDeletedTask({ task: taskToDelete, index });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUndoDelete = () => {
    if (!lastDeletedTask) return;
    setTasks((prev) => {
      const copy = [...prev];
      copy.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
      return copy;
    });
    setLastDeletedTask(null);
  };

  const handleEditTask = (id: string, newText: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const handleToggleAllComplete = () => {
    const allDone = tasks.every((t) => t.completed);
    setTasks((prev) => prev.map((t) => ({ ...t, completed: !allDone })));
  };

  const handleResetSampleTasks = () => {
    setTasks(INITIAL_TASKS);
    setSearchQuery('');
    setFilter('all');
    setSelectedCategory('All');
  };

  // Metrics
  const totalCount = tasks.length;
  const completedCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const activeCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: tasks.length };
    CATEGORIES.forEach((c) => {
      counts[c] = tasks.filter((t) => t.category === c).length;
    });
    return counts;
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = task.text.toLowerCase().includes(query);
        const matchesCategory = task.category?.toLowerCase().includes(query);
        return matchesText || matchesCategory;
      }
      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAt - a.createdAt;
      } else if (sortBy === 'oldest') {
        return a.createdAt - b.createdAt;
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const orderA = priorityOrder[a.priority || 'medium'] || 2;
        const orderB = priorityOrder[b.priority || 'medium'] || 2;
        return orderB - orderA;
      }
      return 0;
    });

    return result;
  }, [tasks, filter, selectedCategory, searchQuery, sortBy]);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between antialiased selection:bg-slate-200">
      {/* Top Bar Header */}
      <header className="w-full border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand lockup */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                TaskFlow
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Landscape Workspace</span>
            </div>
          </div>

          {/* Center/Right stats summary */}
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <div className="hidden md:flex items-center gap-2 font-medium text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-900 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="tabular-nums font-semibold text-slate-800">
                {completedCount}/{totalCount} Done ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Landscape Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================================ */}
          {/* LEFT PANEL: Task Creation, Progress Meter & Category Filters */}
          {/* ================================================================ */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 1. Add Task Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Add New Task
                </h2>
                <span className="text-xs text-slate-400">Quick entry</span>
              </div>
              <TaskInput onAddTask={handleAddTask} categories={CATEGORIES} />
            </div>

            {/* 2. Progress & Focus Widget */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Daily Focus
              </h2>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <span className="block text-xl font-bold text-slate-900 tabular-nums">
                    {totalCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Total</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <span className="block text-xl font-bold text-amber-600 tabular-nums">
                    {activeCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Pending</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <span className="block text-xl font-bold text-emerald-600 tabular-nums">
                    {completedCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Completed</span>
                </div>
              </div>

              {/* Progress bar with percentage */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Task Completion</span>
                  <span className="tabular-nums font-semibold text-slate-800">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                {activeCount === 0 && totalCount > 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> All tasks completed for today!
                  </span>
                ) : (
                  <span>
                    Keep going! <strong className="text-slate-800 tabular-nums">{activeCount}</strong>{' '}
                    {activeCount === 1 ? 'task' : 'tasks'} remaining.
                  </span>
                )}
              </div>
            </div>

            {/* 3. Category Navigation Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-slate-400" />
                Categories
              </h2>
              <div className="space-y-1">
                {['All', ...CATEGORIES].map((cat) => {
                  const isActive = selectedCategory === cat;
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat === 'All' ? 'All Tasks' : cat}</span>
                      <span
                        className={`text-[11px] tabular-nums px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Batch Operations */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleToggleAllComplete}
                disabled={totalCount === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-slate-500" />
                <span>
                  {tasks.length > 0 && tasks.every((t) => t.completed)
                    ? 'Mark All as Pending'
                    : 'Mark All as Completed'}
                </span>
              </button>

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Completed ({completedCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetSampleTasks}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reset to Sample Tasks</span>
              </button>
            </div>
          </aside>

          {/* ================================================================ */}
          {/* RIGHT PANEL: Wide Landscape Task Manager View */}
          {/* ================================================================ */}
          <section className="lg:col-span-8 space-y-4">
            {/* Task Controls Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Title & Count */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                      {selectedCategory === 'All' ? 'All Tasks' : `${selectedCategory} Tasks`}
                    </h1>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 tabular-nums">
                      {filteredTasks.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {filter === 'all'
                      ? 'Showing all items in this view'
                      : filter === 'active'
                      ? 'Showing pending tasks only'
                      : 'Showing completed tasks only'}
                  </p>
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      filter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('active')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      filter === 'active'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('completed')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      filter === 'completed'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Second row: Search & Sort Bar */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search box */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-slate-800 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:border-slate-800 transition-all cursor-pointer font-medium"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">Priority (High to Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
                  <EmptyState
                    filter={filter}
                    totalCount={totalCount}
                    searchQuery={searchQuery}
                    onResetSampleTasks={handleResetSampleTasks}
                  />
                </div>
              ) : (
                <ul className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {filteredTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onDeleteTask={handleDeleteTask}
                        onEditTask={handleEditTask}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Landscape bottom info bar */}
            <div className="px-2 pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  Tip: Double-click any task to edit inline, or press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Enter</kbd> to save
                </span>
              </span>
              <span className="tabular-nums">
                {activeCount} active · {completedCount} completed
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Undo Notification Toast */}
      <AnimatePresence>
        {lastDeletedTask && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-800">
              <span className="truncate max-w-[220px] sm:max-w-xs text-slate-200">
                Task removed from list
              </span>
              <button
                type="button"
                onClick={handleUndoDelete}
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Undo
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 py-4 bg-white/60 text-center text-xs text-slate-400 mt-8">
        <p>TaskFlow Landscape Workspace · Modern task productivity</p>
      </footer>
    </div>
  );
}
