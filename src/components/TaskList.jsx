import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, CheckSquare, Square, Trash2, Edit2, ChevronDown, ChevronUp, CheckCircle2, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { getRelativeLabel, isOverdue, isDueToday } from '../utils/dateUtils';

function SubtaskRow({ subtask, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-2 py-1 group/sub">
      <button onClick={onToggle} className="text-slate-400 hover:text-indigo-600 shrink-0">
        {subtask.completed
          ? <CheckCircle2 size={15} className="text-emerald-500" />
          : <Square size={15} />}
      </button>
      <span className={`text-xs flex-1 ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
        {subtask.title}
      </span>
      <button onClick={onDelete} className="opacity-0 group-hover/sub:opacity-100 text-slate-300 hover:text-red-500 transition-opacity shrink-0">
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function TaskCard({ task, project, onEdit, onDelete, onToggle, onToggleSubtask, onDeleteSubtask }) {
  const [expanded, setExpanded] = useState(false);
  const rel = getRelativeLabel(task.dueDate);
  const pri = PRIORITIES[task.priority];
  const st  = TASK_STATUSES[task.status];
  const done = task.status === 'completed' || task.status === 'cancelled';

  const relColor = rel?.type === 'overdue' ? 'text-red-600 font-semibold' :
                   rel?.type === 'today'   ? 'text-orange-600 font-semibold' :
                   rel?.type === 'soon'    ? 'text-amber-600' : 'text-slate-400';

  const completedSubs = (task.subtasks||[]).filter(s => s.completed).length;

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all ${done ? 'opacity-60 border-slate-100' : 'border-slate-200 hover:border-indigo-200'}`}>
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
              {project && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: project.color }} />
                  {project.name}
                </span>
              )}
              {rel && <span className={`text-xs ${relColor}`}>{rel.text}</span>}
              {task.subtasks?.length > 0 && (
                <button onClick={() => setExpanded(v => !v)} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                  <CheckSquare size={11} />
                  {completedSubs}/{task.subtasks.length}
                  {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              )}
            </div>

            {task.description && !expanded && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
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

export default function TaskList() {
  const {
    tasks, projects, taskFilters, setTaskFilters,
    openModal, deleteTask, toggleTaskDone, toggleSubtask, deleteSubtask
  } = useApp();

  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (taskFilters.search) {
        const q = taskFilters.search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !(t.description||'').toLowerCase().includes(q)) return false;
      }
      if (taskFilters.projectId && t.projectId !== taskFilters.projectId) return false;
      if (taskFilters.priority  && t.priority  !== taskFilters.priority)  return false;
      if (taskFilters.status    && t.status    !== taskFilters.status)    return false;
      return true;
    }).sort((a, b) => {
      // Sort: overdue first, then by priority, then by date
      const prioOrder = { high: 0, medium: 1, low: 2 };
      const aOver = isOverdue(a.dueDate) ? 0 : isDueToday(a.dueDate) ? 1 : 2;
      const bOver = isOverdue(b.dueDate) ? 0 : isDueToday(b.dueDate) ? 1 : 2;
      if (aOver !== bOver) return aOver - bOver;
      return (prioOrder[a.priority]||1) - (prioOrder[b.priority]||1);
    });
  }, [tasks, taskFilters]);

  const clearFilters = () => setTaskFilters({ search: '', projectId: '', priority: '', status: '' });
  const hasFilters = taskFilters.search || taskFilters.projectId || taskFilters.priority || taskFilters.status;

  const getProject = (id) => projects.find(p => p.id === id);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">משימות</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} מתוך {tasks.length} משימות</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('followup')}
            className="flex items-center gap-2 bg-white border border-violet-300 hover:bg-violet-50 text-violet-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Bell size={16} />
            פולואו-אפ חדש
          </button>
          <button
            onClick={() => openModal('task','create')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            משימה חדשה
          </button>
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש משימות..."
            value={taskFilters.search}
            onChange={e => setTaskFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            showFilters || hasFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Filter size={15} />
          סינון
          {hasFilters && <span className="bg-white text-indigo-600 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">!</span>}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Project */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">פרויקט</label>
            <select
              value={taskFilters.projectId}
              onChange={e => setTaskFilters(f => ({ ...f, projectId: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">הכל</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">עדיפות</label>
            <select
              value={taskFilters.priority}
              onChange={e => setTaskFilters(f => ({ ...f, priority: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">הכל</option>
              <option value="high">גבוהה</option>
              <option value="medium">בינונית</option>
              <option value="low">נמוכה</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">סטטוס</label>
            <select
              value={taskFilters.status}
              onChange={e => setTaskFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">הכל</option>
              <option value="todo">לביצוע</option>
              <option value="in-progress">בתהליך</option>
              <option value="completed">הושלם</option>
              <option value="cancelled">בוטל</option>
            </select>
          </div>

          {hasFilters && (
            <div className="sm:col-span-3 text-left">
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700">נקה סינון</button>
            </div>
          )}
        </div>
      )}

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{hasFilters ? 'לא נמצאו משימות' : 'אין משימות עדיין'}</p>
          <p className="text-sm mt-1">{hasFilters ? 'נסה לשנות את הסינון' : 'לחץ על "משימה חדשה" כדי להתחיל'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              project={getProject(t.projectId)}
              onEdit={() => openModal('task','edit',t)}
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
