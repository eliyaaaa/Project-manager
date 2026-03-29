import React from 'react';
import { LayoutDashboard, FolderKanban, ListChecks, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isOverdue, isDueToday } from '../utils/dateUtils';

const NAV = [
  { id: 'dashboard', label: 'לוח בקרה',  icon: LayoutDashboard },
  { id: 'projects',  label: 'פרויקטים',  icon: FolderKanban    },
  { id: 'tasks',     label: 'משימות',     icon: ListChecks      },
  { id: 'calendar',  label: 'לוז',        icon: CalendarDays    },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, tasks } = useApp();

  const urgentCount = tasks.filter(t =>
    t.status !== 'completed' && t.status !== 'cancelled' &&
    (isOverdue(t.dueDate) || isDueToday(t.dueDate))
  ).length;

  return (
    <aside className="w-60 bg-slate-900 text-slate-100 flex flex-col shrink-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">מנהל פרויקטים</p>
            <p className="text-slate-400 text-xs">ניהול משימות חכם</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-right">{label}</span>
              {id === 'tasks' && urgentCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {urgentCount > 9 ? '9+' : urgentCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700/60">
        <p className="text-slate-500 text-xs text-center">נתונים נשמרים מקומית</p>
      </div>
    </aside>
  );
}
