import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STATUSES = [
  { id: 'pending',   label: 'ממתין' },
  { id: 'done',      label: 'בוצע'  },
];

export default function GeneralFollowUpEditModal() {
  const { modal, closeModal, updateGeneralFollowUp } = useApp();
  const gf = modal?.data || {};

  const [title,  setTitle]  = useState(gf.title  || '');
  const [date,   setDate]   = useState(gf.date   || '');
  const [note,   setNote]   = useState(gf.note   || '');
  const [status, setStatus] = useState(gf.status || 'pending');
  const [errors, setErrors] = useState({});
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(closeModal, 200);
  };

  useEffect(() => {
    const g = modal?.data || {};
    setTitle(g.title  || '');
    setDate(g.date   || '');
    setNote(g.note   || '');
    setStatus(g.status || 'pending');
    setErrors({});
  }, [modal]);

  const validate = () => {
    const e = {};
    if (!date) e.date = 'יש לבחור תאריך';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateGeneralFollowUp(gf.id, {
      title: title.trim(),
      date,
      note: note.trim(),
      status,
    });
    handleClose();
  };

  return (
    <div className={`modal-backdrop fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4${isExiting ? ' exiting' : ''}`} onClick={handleClose}>
      <div className={`modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md${isExiting ? ' exiting' : ''}`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Bell size={16} className="text-violet-600" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">עריכת פולואו-אפ כללי</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">כותרת</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="כותרת הפולואו-אפ (אופציונלי)"
              className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>

          {/* Date */}
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">הערות</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="מה צריך לבדוק / לעשות בפולואו-אפ?"
              rows={3}
              className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">סטטוס</label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    status === s.id
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              שמור שינויים
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
