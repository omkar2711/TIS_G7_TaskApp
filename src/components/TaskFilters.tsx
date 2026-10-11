import React from 'react';
import { FilterType } from '../types';

interface TaskFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalCount: number;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filter,
  onFilterChange,
  totalCount,
  activeCount,
  completedCount,
  onClearCompleted,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 text-xs text-slate-500">
      {/* Remaining count */}
      <div className="font-normal text-slate-500">
        <span className="font-semibold text-slate-800 tabular-nums">
          {activeCount}
        </span>{' '}
        {activeCount === 1 ? 'task' : 'tasks'} remaining
      </div>

      {/* Segmented Filter Buttons */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All <span className="text-[11px] tabular-nums opacity-75">({totalCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('active')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            filter === 'active'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active <span className="text-[11px] tabular-nums opacity-75">({activeCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('completed')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            filter === 'completed'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Completed <span className="text-[11px] tabular-nums opacity-75">({completedCount})</span>
        </button>
      </div>

      {/* Clear completed button */}
      <div>
        {completedCount > 0 ? (
          <button
            type="button"
            onClick={onClearCompleted}
            className="text-slate-500 hover:text-rose-600 transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            Clear completed ({completedCount})
          </button>
        ) : (
          <span className="text-slate-300 select-none">No completed tasks</span>
        )}
      </div>
    </div>
  );
};
