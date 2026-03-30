import React, { useState } from 'react';
import {
  ArrowRight, Plus, Edit2, Trash2, CheckCircle2, Square,
  ChevronDown, ChevronUp, CheckSquare, FolderOpen, Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRIORITIES, TASK_STATUSES, PROJECT_STATUSES } from '../utils/constants';
import { getRelativeLabel, formatDate, formatDateHe } from '../utils/dateUtils';

function SubtaskRow({ subtask, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-2 py-1 group/sub">
      <button onClick={onToggle} className="text-slate-400 hover:text-emerald-500 shrink-0 transition-colors">
        {subtask.completed
          ? <CheckCircle2 size={14} className="text-emerald-500" />
          : <Square size={14} />}
      </button>
      <span className={`text-xs flex-1 ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
        {subtask.title}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover/sub:opacity-100 text-slate-300 hover:text-red-400 transition-opacity shrink-0"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function TaskRow({ task, onEdit, onDelete, onToggle, onToggleSubtask, onDeleteSubtask }) {
  const [expanded, setExpanded] = useState(false);
  const rel  = getRelativeLabel(task.dueDate);
  const pri  = PRIORITIES[task.priority];
  const st   = TASK_STATUSES[task.status];
  const done = task.status === 'completed' || task.status === 'cancelled';

  const relColor =
    rel?.type === 'overdue' ? 'text-red-600 font-semibold' :
    rel?.type === 'today'   ? 'text-orange-600 font-semibold' :
    rel?.type === 'soon'    ? 'text-amber-600' : 'text-slate-400';

  const completedSubs = (task.subtasks || []).filter(s => s.completed).length;

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all ${
      done ? 'opacity-60 border-slate-100' : 'border-slate-200 hover:border-indigo-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button onClick={onToggle} className="mt-0.5 shrink-0 text-slate-300 hover:text-emerald-500 transition-colors">
            {task.status === 'completed'
              ? <CheckCircle2 size={20} className="text-emerald-500" />
              : <Square size={20} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className={`text-sm font-semibold flex-1 min-w-0 ${done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri?.bgClass}`}>{pri?.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${st?.bgClass}`}>{st?.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {rel && <span className={`text-xs ${relColor}`}>{rel.text}</span>}
              {task.subtasks?.length > 0 && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <CheckSquare size={11} />
                  {completedSubs}/{task.subtasks.length}
                  {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
            )}

            {/* Assignee / due date / follow-up */}
            {(task.assignee || task.dueDate || task.followUp?.date) && (
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {task.assignee && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="text-slate-400">אחראי:</span> {task.assignee}
                  </span>
                )}
                {task.dueDate && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="text-slate-400">יעד:</span> {formatDate(task.dueDate)}
                  </span>
                )}
                {task.followUp?.date && (
                  <span className="text-xs text-violet-600 flex items-center gap-1">
                    <Bell size={10} />
                    {formatDate(task.followUp.date)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Subtasks */}
      {expanded && task.subtasks?.length > 0 && (
        <div className="border-t border-slate-50 px-4 pb-3 pt-2 pr-12">
          {task.subtasks.map(s => (
            <SubtaskRow
              key={s.id}
              subtask={s}
              onToggle={() => onToggleSubtask(task.id, s.id)}
              onDelete={() => onDeleteSubtask(task.id, s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_TABS = [
  { id: '',            label: 'הכל'     },
  { id: 'todo',        label: 'לביצוע'  },
  { id: 'in-progress', label: 'בתהליך'  },
  { id: 'completed',   label: 'הושלם'   },
  { id: 'cancelled',   label: 'בוטל'    },
];

export default function ProjectDetail() {
  const {
    projects, tasks,
    selectedProjectId,
    setCurrentPage,
    openModal,
    deleteTask, toggleTaskDone, toggleSubtask, deleteSubtask,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const project = projects.find(p => p.id === selectedProjectId);
  if (!project) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>הפרויקט לא נמצא.</p>
        <button onClick={() => setCurrentPage('projects')} className="mt-3 text-indigo-600 text-sm hover:underline">
          חזור לפרויקטים
        </button>
      </div>
    );
  }

  const allProjectTasks = tasks.filter(t => t.projectId === project.id);
  const filtered = statusFilter
    ? allProjectTasks.filter(t => t.status === statusFilter)
    : allProjectTasks;

  // Sorted: active/urgent first, then by priority
  const prioOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...filtered].sort((a, b) => {
    const aDone = a.status === 'completed' || a.status === 'cancelled' ? 1 : 0;
    const bDone = b.status === 'completed' || b.status === 'cancelled' ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return (prioOrder[a.priority] ?? 1) - (prioOrder[b.priority] ?? 1);
  });

  const st      = PROJECT_STATUSES[project.status];
  const done    = allProjectTasks.filter(t => t.status === 'completed').length;
  const total   = allProjectTasks.length;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  const countFor = (s) => s ? allProjectTasks.filter(t => t.status === s).length : total;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Back button */}
      <button
        onClick={() => setCurrentPage('projects')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowRight size={15} />
        חזור לפרויקטים
      </button>

      {/* Project header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-2 w-full" style={{ background: project.color }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: project.color + '22' }}>
                <FolderOpen size={20} style={{ color: project.color }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${st?.bgClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st?.dotClass}`} />
                {st?.label}
              </span>
              <button
                onClick={() => openModal('project', 'edit', project)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 size={15} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{pct}% הושלם</span>
              <span>{done} מתוך {total} משימות</span>
            </div>
            <div className="bg-slate-100 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: project.color }}
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: 'לביצוע',  s: 'todo',         color: 'text-slate-600'  },
              { label: 'בתהליך',  s: 'in-progress',  color: 'text-blue-600'   },
              { label: 'הושלמו',  s: 'completed',    color: 'text-emerald-600'},
              { label: 'בוטלו',   s: 'cancelled',    color: 'text-red-500'    },
            ].map(({ label, s, color }) => (
              <div key={s} className="text-center bg-slate-50 rounded-lg py-2">
                <p className={`text-lg font-bold ${color}`}>{allProjectTasks.filter(t => t.status === s).length}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks section */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">משימות הפרויקט</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('followup', 'create', null, { projectId: project.id })}
            className="flex items-center gap-2 bg-white border border-violet-300 hover:bg-violet-50 text-violet-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Bell size={15} />
            פולואו-אפ חדש
          </button>
          <button
            onClick={() => openModal('task', 'create', null, { projectId: project.id })}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={15} />
            משימה חדשה
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className="mr-1.5 text-xs opacity-70">({countFor(tab.id)})</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="text-center py-14 text-slate-400">
          <CheckSquare size={38} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{statusFilter ? 'אין משימות בסטטוס זה' : 'אין משימות בפרויקט'}</p>
          {!statusFilter && (
            <p className="text-sm mt-1">לחץ "משימה חדשה" כדי להתחיל</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(t => (
            <TaskRow
              key={t.id}
              task={t}
              onEdit={() => openModal('task', 'edit', t)}
              onDelete={() => setConfirmDelete(t.id)}
              onToggle={() => toggleTaskDone(t.id)}
              onToggleSubtask={toggleSubtask}
              onDeleteSubtask={deleteSubtask}
            />
          ))}
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-slate-900 text-lg mb-2">מחיקת משימה</h3>
            <p className="text-slate-600 text-sm">האם אתה בטוח שברצונך למחוק משימה זו?</p>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">ביטול</button>
              <button onClick={() => { deleteTask(confirmDelete); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">מחק</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
