import React from 'react';
import { CheckCircle2, ListTodo, Sparkles, Inbox } from 'lucide-react';
import { FilterType } from '../types';

interface EmptyStateProps {
  filter: FilterType;
  totalCount: number;
  searchQuery?: string;
  onResetSampleTasks?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filter,
  totalCount,
  searchQuery,
  onResetSampleTasks,
}) => {
  if (searchQuery) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">No matching tasks</h4>
        <p className="text-xs text-slate-500">
          No tasks found matching &quot;{searchQuery}&quot;. Try a different search term.
        </p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <ListTodo className="w-6 h-6 stroke-[1.75]" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">Your task list is empty</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Type a task in the box above and click Add to start organizing your day.
        </p>
        {onResetSampleTasks && (
          <button
            type="button"
            onClick={onResetSampleTasks}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-600" />
            Load sample tasks
          </button>
        )}
      </div>
    );
  }

  if (filter === 'active') {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-6 h-6 stroke-[2]" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">All caught up!</h4>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          You don&apos;t have any pending active tasks right now. Great job!
        </p>
      </div>
    );
  }

  if (filter === 'completed') {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <CheckCircle2 className="w-6 h-6 stroke-[1.75]" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">No completed tasks yet</h4>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Check off tasks as you finish them to see your completed accomplishments here.
        </p>
      </div>
    );
  }

  return null;
};
