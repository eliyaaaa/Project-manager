import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PROJECT_COLORS, PROJECT_STATUSES } from '../../utils/constants';

export default function ProjectModal() {
  const { modal, closeModal, addProject, updateProject } = useApp();
  const isEdit = modal?.mode === 'edit';
  const proj   = modal?.data;

  const [form, setForm] = useState({
    name: '', description: '', status: 'active', color: PROJECT_COLORS[0],
  });
  const [errors, setErrors] = useState({});
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(closeModal, 200);
  };

  useEffect(() => {
    if (isEdit && proj) {
      setForm({ name: proj.name, description: proj.description||'', status: proj.status, color: proj.color });
    } else {
      setForm({ name: '', description: '', status: 'active', color: PROJECT_COLORS[0] });
    }
    setErrors({});
  }, [modal]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'שם הפרויקט הוא שדה חובה';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { name: form.name.trim(), description: form.description.trim(), status: form.status, color: form.color };
    if (isEdit) updateProject(proj.id, data);
    else addProject(data);
    handleClose();
  };

  return (
    <div className={`modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4${isExiting ? ' exiting' : ''}`} onClick={handleClose}>
      <div className={`modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md${isExiting ? ' exiting' : ''}`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">{isEdit ? 'עריכת פרויקט' : 'פרויקט חדש'}</h2>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">שם הפרויקט <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="הכנס שם פרויקט..."
              className={`w-full border rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
              autoFocus
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">תיאור</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="תיאור קצר של הפרויקט..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">סטטוס</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PROJECT_STATUSES).map(([key, st]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('status', key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
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

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">צבע</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              ביטול
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              {isEdit ? 'שמור שינויים' : 'צור פרויקט'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
