import React from 'react';
import { useApp } from '../context/AppContext';
import { PRIORITIES, PROJECT_STATUSES } from '../utils/constants';
import { formatDate, formatDateHe, getRelativeLabel, today, formatMonthYear } from '../utils/dateUtils';
import { DAYS_HE, MONTHS_HE } from '../utils/constants';

function todayLabel() {
  const d = new Date();
  return `${DAYS_HE[d.getDay()]}, ${d.getDate()} ב${MONTHS_HE[d.getMonth()]} ${d.getFullYear()}`;
}

function TaskRow({ task }) {
  const pri = PRIORITIES[task.priority];
  const rel = getRelativeLabel(task.dueDate);

  const relColor =
    rel?.type === 'overdue' ? 'text-red-600 font-semibold' :
    rel?.type === 'today'   ? 'text-orange-600 font-semibold' :
    rel?.type === 'soon'    ? 'text-amber-600' : 'text-slate-400';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      {/* Priority dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${pri?.dotClass}`} />

      {/* Title + assignee */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 truncate">{task.title}</p>
        {task.assignee && (
          <p className="text-xs text-slate-400 mt-0.5">{task.assignee}</p>
        )}
      </div>

      {/* Due date */}
      <div className="shrink-0 text-left">
        {rel
          ? <span className={`text-xs ${relColor}`}>{rel.text}</span>
          : <span className="text-xs text-slate-300">ללא תאריך</span>
        }
      </div>

      {/* Priority badge */}
      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${pri?.bgClass}`}>
        {pri?.label}
      </span>
    </div>
  );
}

function ProjectSection({ project, tasks }) {
  const open   = tasks.filter(t => t.projectId === project.id && t.status !== 'completed' && t.status !== 'cancelled');
  const all    = tasks.filter(t => t.projectId === project.id);
  const done   = all.filter(t => t.status === 'completed').length;
  const pct    = all.length ? Math.round((done / all.length) * 100) : 0;
  const st     = PROJECT_STATUSES[project.status];

  if (open.length === 0) return null;

  const sorted = [...open].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Project header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: project.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800 text-sm truncate">{project.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${st?.bgClass}`}>{st?.label}</span>
            <span className="text-xs text-slate-400 mr-auto">{open.length} פתוחות</span>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${pct}%`, background: project.color }}
              />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Task rows */}
      <div className="px-4 divide-y divide-slate-50">
        {sorted.map(t => <TaskRow key={t.id} task={t} />)}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const { projects, tasks } = useApp();

  const openTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');

  const activeProjects = projects.filter(p => p.status === 'active');

  const noProjectTasks = openTasks
    .filter(t => !t.projectId || !projects.find(p => p.id === t.projectId))
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Page header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">משימות פתוחות</h1>
          <p className="text-slate-500 text-sm mt-0.5">{todayLabel()}</p>
        </div>
        <div className="text-left">
          <p className="text-3xl font-bold text-indigo-600">{openTasks.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">משימות פתוחות</p>
        </div>
      </div>

      {/* Active projects */}
      {activeProjects.map(proj => (
        <ProjectSection key={proj.id} project={proj} tasks={tasks} />
      ))}

      {/* Tasks without project */}
      {noProjectTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300 shrink-0" />
            <h2 className="font-semibold text-slate-700 text-sm">משימות ללא פרויקט</h2>
            <span className="text-xs text-slate-400">{noProjectTasks.length} משימות</span>
          </div>
          <div className="px-4 divide-y divide-slate-50">
            {noProjectTasks.map(t => <TaskRow key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {openTasks.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">אין משימות פתוחות 🎉</p>
          <p className="text-sm mt-1">כל המשימות הושלמו</p>
        </div>
      )}
    </div>
  );
}
