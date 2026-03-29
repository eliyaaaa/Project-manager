import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRIORITIES } from '../utils/constants';
import { toDateStr, formatMonthYear, getDaysInMonth, getWeekDays, startOfWeek, today } from '../utils/dateUtils';
import { DAYS_HE } from '../utils/constants';

const SHORT_DAYS = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];

function TaskPill({ task, project, onClick }) {
  const pri = PRIORITIES[task.priority];
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(task); }}
      className={`w-full text-right text-xs px-1.5 py-0.5 rounded truncate font-medium ${pri?.bgClass} hover:opacity-80 transition-opacity`}
      title={task.title}
    >
      {task.title}
    </button>
  );
}

// ─── MONTH VIEW ────────────────────────────────────────────────────────────────
function MonthView({ date, tasks, projects, onTaskClick, onDayClick }) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const days  = getDaysInMonth(year, month);
  const todayStr = today();

  const getProject = (id) => projects.find(p => p.id === id);

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {SHORT_DAYS.map((d, i) => (
          <div key={i} className="py-2 text-center text-xs font-semibold text-slate-500">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="border-b border-l border-slate-100 min-h-[100px] bg-slate-50/40" />;
          const ds = toDateStr(d);
          const dayTasks = tasks.filter(t => t.dueDate === ds && t.status !== 'cancelled');
          const isToday  = ds === todayStr;
          const isOtherMonth = d.getMonth() !== month;
          return (
            <div
              key={i}
              onClick={() => onDayClick(ds)}
              className={`border-b border-l border-slate-100 min-h-[100px] p-1.5 cursor-pointer hover:bg-indigo-50/40 transition-colors ${isOtherMonth ? 'bg-slate-50/60 opacity-50' : ''}`}
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full mb-1 ${
                isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
              }`}>
                {d.getDate()}
              </span>
              <div className="space-y-0.5">
                {dayTasks.slice(0,3).map(t => (
                  <TaskPill key={t.id} task={t} project={getProject(t.projectId)} onClick={onTaskClick} />
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-xs text-slate-400 pr-1">+{dayTasks.length - 3} עוד</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── WEEK VIEW ─────────────────────────────────────────────────────────────────
function WeekView({ date, tasks, projects, onTaskClick, onDayClick }) {
  const weekStart = startOfWeek(date);
  const days = getWeekDays(weekStart);
  const todayStr = today();
  const getProject = (id) => projects.find(p => p.id === id);

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {days.map((d, i) => {
          const ds = toDateStr(d);
          const isToday = ds === todayStr;
          return (
            <div key={i} className={`py-3 text-center border-l border-slate-100 ${isToday ? 'bg-indigo-50' : ''}`}>
              <p className="text-xs text-slate-500">{SHORT_DAYS[i]}</p>
              <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full mt-0.5 ${
                isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
              }`}>
                {d.getDate()}
              </span>
              <p className="text-xs text-slate-400">{d.getMonth()+1}/{d.getDate()}</p>
            </div>
          );
        })}
      </div>

      {/* Tasks columns */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {days.map((d, i) => {
          const ds = toDateStr(d);
          const dayTasks = tasks.filter(t => t.dueDate === ds && t.status !== 'cancelled');
          const isToday = ds === todayStr;
          return (
            <div
              key={i}
              onClick={() => onDayClick(ds)}
              className={`border-l border-b border-slate-100 p-2 space-y-1.5 cursor-pointer hover:bg-indigo-50/30 transition-colors min-h-[200px] ${isToday ? 'bg-indigo-50/20' : ''}`}
            >
              {dayTasks.map(t => (
                <TaskPill key={t.id} task={t} project={getProject(t.projectId)} onClick={onTaskClick} />
              ))}
              {dayTasks.length === 0 && (
                <div className="flex items-center justify-center h-8 opacity-0 hover:opacity-100 transition-opacity">
                  <Plus size={14} className="text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function CalendarView() {
  const { tasks, projects, openModal } = useApp();
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
  const [date, setDate] = useState(new Date());

  const navigate = (dir) => {
    const d = new Date(date);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + dir);
    } else {
      d.setDate(d.getDate() + dir * 7);
    }
    setDate(d);
  };

  const goToday = () => setDate(new Date());

  const title = viewMode === 'month'
    ? formatMonthYear(date)
    : (() => {
        const ws = startOfWeek(date);
        const we = new Date(ws); we.setDate(we.getDate() + 6);
        return `${ws.getDate()}/${ws.getMonth()+1} – ${we.getDate()}/${we.getMonth()+1}/${we.getFullYear()}`;
      })();

  const handleTaskClick = (task) => openModal('task','edit',task);
  const handleDayClick  = (ds) => openModal('task','create',null,{ dueDate: ds });

  return (
    <div className="flex flex-col h-full p-6 gap-4 max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">לוז</h1>
          <p className="text-slate-500 text-sm mt-0.5">{title}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            {['month','week'].map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === 'month' ? 'חודש' : 'שבוע'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ChevronRight size={16} />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
              היום
            </button>
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ChevronLeft size={16} />
            </button>
          </div>

          <button
            onClick={() => openModal('task','create')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={15} />
            משימה
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-200" />גבוהה</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-200" />בינונית</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-200" />נמוכה</span>
        <span className="text-slate-400">לחץ על יום להוספת משימה</span>
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
        {viewMode === 'month'
          ? <MonthView date={date} tasks={tasks} projects={projects} onTaskClick={handleTaskClick} onDayClick={handleDayClick} />
          : <WeekView  date={date} tasks={tasks} projects={projects} onTaskClick={handleTaskClick} onDayClick={handleDayClick} />
        }
      </div>
    </div>
  );
}
