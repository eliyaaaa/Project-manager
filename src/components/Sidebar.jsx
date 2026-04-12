import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FolderKanban, ListChecks, CalendarDays, CheckCircle2, Bell, LogOut, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isOverdue, isDueToday, today } from '../utils/dateUtils';
import { supabase } from '../utils/supabaseClient';

const NAV = [
  { id: 'dashboard', label: 'לוח בקרה',    icon: LayoutDashboard },
  { id: 'projects',  label: 'פרויקטים',   icon: FolderKanban    },
  { id: 'tasks',     label: 'כל המשימות', icon: ListChecks      },
  { id: 'followups', label: 'פולואו-אפ',  icon: Bell            },
  { id: 'calendar',  label: 'לוז',        icon: CalendarDays    },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, tasks, sidebarOpen, setSidebarOpen } = useApp();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function handleNav(id) {
    setCurrentPage(id);
    setSidebarOpen(false); // close on mobile after navigation
  }

  const urgentCount = tasks.filter(t =>
    t.status !== 'completed' && t.status !== 'cancelled' &&
    (isOverdue(t.dueDate) || isDueToday(t.dueDate))
  ).length;

  const followUpTodayCount = tasks.filter(t =>
    t.followUp?.date === today() && t.status !== 'completed' && t.status !== 'cancelled'
  ).length;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 right-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col h-dvh
        transform transition-transform duration-250 ease-in-out
        md:relative md:top-auto md:translate-x-0 md:w-60 md:shrink-0 md:h-full
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        {/* Logo + close button */}
        <div className="px-5 py-6 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">מנהל פרויקטים</p>
              <p className="text-slate-400 text-xs">ניהול משימות חכם</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="סגור תפריט"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-indigo-100 text-indigo-800 rounded-l-lg border-r-[3px] border-indigo-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-lg'
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-right">{label}</span>
                {id === 'tasks' && urgentCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {urgentCount > 9 ? '9+' : urgentCount}
                  </span>
                )}
                {id === 'followups' && followUpTodayCount > 0 && (
                  <span className="bg-violet-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {followUpTodayCount > 9 ? '9+' : followUpTodayCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer — user + logout */}
        <div className="px-4 py-4 border-t border-slate-700/60 space-y-2 shrink-0">
          {userEmail && (
            <p className="text-slate-400 text-xs truncate text-right" title={userEmail}>{userEmail}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition text-sm min-h-[44px]"
          >
            <LogOut size={16} />
            <span className="flex-1 text-right">התנתק</span>
          </button>
        </div>
      </aside>
    </>
  );
}
