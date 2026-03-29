export const PROJECT_STATUSES = {
  active:    { label: 'פעיל',         bgClass: 'bg-emerald-100 text-emerald-800', dotClass: 'bg-emerald-500' },
  completed: { label: 'הושלם',        bgClass: 'bg-slate-100 text-slate-600',     dotClass: 'bg-slate-400'   },
  paused:    { label: 'מושהה',        bgClass: 'bg-amber-100 text-amber-800',     dotClass: 'bg-amber-500'   },
  reference: { label: 'בהתייחסות',   bgClass: 'bg-violet-100 text-violet-800',   dotClass: 'bg-violet-500'  },
};

export const TASK_STATUSES = {
  todo:        { label: 'לביצוע', bgClass: 'bg-slate-100 text-slate-700',   dotClass: 'bg-slate-400'  },
  'in-progress':{ label: 'בתהליך', bgClass: 'bg-blue-100 text-blue-800',    dotClass: 'bg-blue-500'   },
  completed:   { label: 'הושלם',  bgClass: 'bg-emerald-100 text-emerald-800', dotClass: 'bg-emerald-500' },
  cancelled:   { label: 'בוטל',   bgClass: 'bg-red-100 text-red-700',       dotClass: 'bg-red-400'    },
};

export const PRIORITIES = {
  high:   { label: 'גבוהה',   bgClass: 'bg-red-100 text-red-800',      dotClass: 'bg-red-500',    icon: '🔴' },
  medium: { label: 'בינונית', bgClass: 'bg-orange-100 text-orange-800', dotClass: 'bg-orange-500', icon: '🟡' },
  low:    { label: 'נמוכה',   bgClass: 'bg-green-100 text-green-700',  dotClass: 'bg-green-500',  icon: '🟢' },
};

export const PROJECT_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444',
  '#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#14b8a6','#84cc16','#f43f5e',
];

export const DAYS_HE   = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
export const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
