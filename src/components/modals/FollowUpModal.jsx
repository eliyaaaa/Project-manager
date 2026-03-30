import React, { useState, useEffect, useMemo } from 'react';
import { X, Bell, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { today } from '../../utils/dateUtils';
import { PRIORITIES, TASK_STATUSES } from '../../utils/constants';

export default function FollowUpModal() {
  const { modal, closeModal, updateTask, projects, tasks } = useApp();
  const defaults = modal?.defaults || {};

  const [projectId, setProjectId] = useState(defaults.projectId || '');
  const [taskId,    setTaskId]    = useState(defaults.taskId    || '');
  const [date,      setDate]      = useState(defaults.date      || '');
  const [note,      setNote]      = useState('');
  const [errors,    setErrors]    = useState({});

  // When modal opens, reset to defaults
  useEffect(() => {
    const d = modal?.defaults || {};
    setProjectId(d.projectId || '');
    setTaskId(d.taskId || '');
    setDate(d.date || '');
    setNote('');
    setErrors({});
  }, [modal]);

  // Tasks filtered by selected project (exclude cancelled)
  const availableTasks = useMemo(() => {
    const base = tasks.filter(t => t.status !== 'cancelled');
    if (!projectId) return base;
    return base.filter(t => t.projectId === projectId);
  }, [tasks, projectId]);

  // When project changes, clear task if it no longer belongs
  useEffect(() => {
    if (taskId && projectId) {
      const found = availableTasks.find(t => t.id === taskId);
      if (!found) setTaskId('');
    }
  }, [projectId]);

  // Pre-fill note from existing followUp if task already has one
  useEffect(() => {
    if (taskId) {
      const t = tasks.find(x => x.id === taskId);
      if (t?.followUp?.note) setNote(t.followUp.note);
      else setNote('');
    }
  }, [taskId]);

  const selectedTask = tasks.find(t => t.id === taskId);

  const validate = () => {
    const e = {};
    if (!taskId)   e.taskId = 'יש לבחור משימה';
    if (!date)     e.date   = 'יש לבחור תאריך פולואו-אפ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateTask(taskId, {
      followUp: { date, note: note.trim() },
    });
    closeModal();
  };

  const pri = selectedTask ? PRIORITIES[selectedTask.priority] : null;
  const st  = selectedTask ? TASK_STATUSES[selectedTask.status]  : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Bell size={16} className="text-violet-600" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">פולואו-אפ חדש</h2>
          </div>
          <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Project selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">פרויקט (אופציונלי)</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="">כל הפרויקטים</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Task selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              משימה <span className="text-red-500">*</span>
            </label>
            <select
              value={taskId}
              onChange={e => setTaskId(e.target.value)}
              className={`w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 ${
                errors.taskId ? 'border-red-400' : 'border-slate-200'
              }`}
            >
              <option value="">בחר משימה...</option>
              {availableTasks.map(t => {
                const p = projects.find(x => x.id === t.projectId);
                return (
                  <option key={t.id} value={t.id}>
                    {t.title}{p ? ` (${p.name})` : ''}
                  </option>
                );
              })}
            </select>
            {errors.taskId && <p className="text-xs text-red-500 mt-1">{errors.taskId}</p>}
          </div>

          {/* Selected task preview */}
          {selectedTask && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{selectedTask.title}</p>
                {selectedTask.description && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{selectedTask.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {pri && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri.bgClass}`}>{pri.label}</span>}
                {st  && <span className={`text-xs px-2 py-0.5 rounded-full ${st.bgClass}`}>{st.label}</span>}
              </div>
            </div>
          )}

          {/* Follow-up date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              תאריך פולואו-אפ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={`w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 ${
                errors.date ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">הערה לפולואו-אפ</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="מה צריך לבדוק / לעשות בפולואו-אפ?"
              rows={3}
              className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
            />
          </div>

          {/* Notice if task already has a follow-up */}
          {selectedTask?.followUp?.date && selectedTask.followUp.date !== date && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-700">
                ⚠️ למשימה זו כבר יש פולואו-אפ בתאריך {selectedTask.followUp.date}. שמירה תחליף אותו.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              שמור פולואו-אפ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
