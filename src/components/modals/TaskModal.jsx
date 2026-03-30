import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Square, Bell, BellOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { today } from '../../utils/dateUtils';

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

export default function TaskModal() {
  const { modal, closeModal, addTask, updateTask, projects } = useApp();
  const isEdit = modal?.mode === 'edit';
  const task   = modal?.data;
  const defs   = modal?.defaults || {};

  const [form, setForm] = useState({
    title: '', description: '', projectId: '', dueDate: '', priority: 'medium', status: 'todo', subtasks: [],
    followUp: null, // null = no follow-up, { date, note } = has follow-up
  });
  const [newSub, setNewSub]   = useState('');
  const [errors, setErrors]   = useState({});

  useEffect(() => {
    if (isEdit && task) {
      setForm({
        title: task.title, description: task.description||'',
        projectId: task.projectId||'', dueDate: task.dueDate||'',
        priority: task.priority, status: task.status,
        subtasks: (task.subtasks||[]).map(s => ({ ...s })),
        followUp: task.followUp ? { ...task.followUp } : null,
      });
    } else {
      setForm({
        title: '', description: '',
        projectId: defs.projectId||'',
        dueDate: defs.dueDate||'',
        priority: 'medium', status: 'todo', subtasks: [],
        followUp: null,
      });
    }
    setErrors({});
    setNewSub('');
  }, [modal]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'כותרת המשימה היא שדה חובה';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      projectId: form.projectId || null,
      dueDate: form.dueDate || null,
      priority: form.priority,
      status: form.status,
      subtasks: form.subtasks,
      followUp: form.followUp?.date ? { date: form.followUp.date, note: form.followUp.note || '' } : null,
    };
    if (isEdit) updateTask(task.id, data);
    else addTask(data);
    closeModal();
  };

  const addSub = () => {
    const t = newSub.trim();
    if (!t) return;
    set('subtasks', [...form.subtasks, { id: genId(), title: t, completed: false }]);
    setNewSub('');
  };

  const toggleSub = (id) => {
    set('subtasks', form.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const removeSub = (id) => {
    set('subtasks', form.subtasks.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-bold text-slate-900 text-lg">{isEdit ? 'עריכת משימה' : 'משימה חדשה'}</h2>
          <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">כותרת <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="מה צריך לעשות?"
                className={`w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
                autoFocus
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">תיאור</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="פרטים נוספים..."
                rows={2}
                className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>

            {/* Project + Due date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">פרויקט</label>
                <select
                  value={form.projectId}
                  onChange={e => set('projectId', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">ללא פרויקט</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">תאריך יעד</label>
                <input
                  type="date"
                  value={form.dueDate}
                  min={today()}
                  onChange={e => set('dueDate', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">עדיפות</label>
              <div className="flex gap-2">
                {Object.entries(PRIORITIES).map(([key, pri]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('priority', key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                      form.priority === key
                        ? `${pri.bgClass} border-transparent`
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${pri.dotClass}`} />
                    {pri.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">סטטוס</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TASK_STATUSES).map(([key, st]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('status', key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      form.status === key
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${st.dotClass}`} />
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtasks */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                תת-משימות
                {form.subtasks.length > 0 && (
                  <span className="mr-1.5 text-xs text-slate-400 font-normal">
                    ({form.subtasks.filter(s=>s.completed).length}/{form.subtasks.length} הושלמו)
                  </span>
                )}
              </label>

              {/* Existing subtasks */}
              {form.subtasks.length > 0 && (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 mb-2 overflow-hidden">
                  {form.subtasks.map(s => (
                    <div key={s.id} className="flex items-center gap-2 px-3 py-2 group hover:bg-slate-50 transition-colors">
                      <button type="button" onClick={() => toggleSub(s.id)} className="shrink-0 text-slate-300 hover:text-emerald-500 transition-colors">
                        {s.completed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Square size={16} />}
                      </button>
                      <span className={`text-sm flex-1 ${s.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{s.title}</span>
                      <button type="button" onClick={() => removeSub(s.id)} className="shrink-0 text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new subtask */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSub}
                  onChange={e => setNewSub(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }}
                  placeholder="הוסף שלב..."
                  className="flex-1 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  type="button"
                  onClick={addSub}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Follow-up */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Toggle header */}
              <button
                type="button"
                onClick={() => set('followUp', form.followUp ? null : { date: '', note: '' })}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                  form.followUp ? 'bg-violet-50 text-violet-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {form.followUp ? <Bell size={15} className="text-violet-600" /> : <BellOff size={15} />}
                  פולואו-אפ
                  {form.followUp?.date && (
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                      {form.followUp.date}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{form.followUp ? 'לחץ להסרה' : 'לחץ להוספה'}</span>
              </button>

              {/* Follow-up fields */}
              {form.followUp && (
                <div className="px-4 py-3 space-y-3 bg-white">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">תאריך פולואו-אפ</label>
                    <input
                      type="date"
                      value={form.followUp.date}
                      onChange={e => set('followUp', { ...form.followUp, date: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">הערה לפולואו-אפ</label>
                    <textarea
                      value={form.followUp.note}
                      onChange={e => set('followUp', { ...form.followUp, note: e.target.value })}
                      placeholder="מה צריך לבדוק / לעשות בפולואו-אפ?"
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-5 flex gap-3 shrink-0">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              ביטול
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              {isEdit ? 'שמור שינויים' : 'צור משימה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
