import React from 'react';
import { AlertCircle, Clock, CheckCircle2, FolderOpen, Plus, ArrowLeft, TrendingUp, Bell, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isOverdue, isDueToday, getRelativeLabel, formatDate, daysDiff, today } from '../utils/dateUtils';
import { PRIORITIES, TASK_STATUSES, PROJECT_STATUSES } from '../utils/constants';

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    red:    'bg-red-50    border-red-200    text-red-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    green:  'bg-green-50  border-green-200  text-green-600',
  };
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-4 ${colors[color]}`}>
      <div className="rounded-lg bg-white/70 p-2.5">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function TaskRow({ task, project, onEdit }) {
  const rel = getRelativeLabel(task.dueDate);
  const pri = PRIORITIES[task.priority];
  const relColor = rel?.type === 'overdue' ? 'text-red-600 font-semibold' :
                   rel?.type === 'today'   ? 'text-orange-600 font-semibold' :
                   rel?.type === 'soon'    ? 'text-amber-600' : 'text-slate-500';
  const hasPendingFollowUp = task.followUp?.date && task.status !== 'completed';
  return (
    <button
      onClick={() => onEdit(task)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg text-right transition-colors group"
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${pri?.dotClass}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
        {project && <p className="text-xs text-slate-400 truncate">{project.name}</p>}
      </div>
      {hasPendingFollowUp && (
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 bg-orange-100 text-orange-700 font-medium">ממתין לתגובה</span>
      )}
      {rel && <span className={`text-xs shrink-0 ${relColor}`}>{rel.text}</span>}
      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${pri?.bgClass}`}>{pri?.label}</span>
    </button>
  );
}

function FollowUpRow({ title, subtitle, date, onEdit }) {
  const rel = getRelativeLabel(date);
  const relColor = rel?.type === 'overdue' ? 'text-red-600 font-semibold' :
                   rel?.type === 'today'   ? 'text-orange-600 font-semibold' : 'text-slate-500';
  return (
    <button
      onClick={onEdit}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg text-right transition-colors group"
    >
      <Bell size={14} className="text-violet-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full shrink-0 bg-violet-100 text-violet-700 font-medium">פולואו-אפ</span>
      {rel && <span className={`text-xs shrink-0 ${relColor}`}>{rel.text}</span>}
    </button>
  );
}

export default function Dashboard() {
  const { projects, tasks, generalFollowUps, openModal, setCurrentPage, navigateToProject } = useApp();

  const activeTasks  = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const overdue      = activeTasks.filter(t => isOverdue(t.dueDate));
  const dueToday     = activeTasks.filter(t => isDueToday(t.dueDate));
  const dueSoon      = activeTasks.filter(t => { const d = daysDiff(t.dueDate); return d !== null && d > 0 && d <= 7; });
  const completedAll = tasks.filter(t => t.status === 'completed');

  const urgent = [...overdue, ...dueToday].sort((a,b) => (a.dueDate||'') < (b.dueDate||'') ? -1 : 1);

  const todayStr = today();

  // Follow-up items due today or overdue — task follow-ups
  const urgentFollowUpTasks = tasks.filter(t =>
    t.followUp?.date && t.followUp.date <= todayStr && t.status !== 'completed' && t.status !== 'cancelled'
  );
  // Follow-up items due today or overdue — general follow-ups
  const urgentGeneralFollowUps = (generalFollowUps || []).filter(g => g.date <= todayStr);
  const followUpsToday = tasks.filter(t =>
    t.followUp?.date === todayStr && t.status !== 'completed' && t.status !== 'cancelled'
  );

  const getProject = (id) => projects.find(p => p.id === id);

  // Recurring topics: group recurring tasks by recurringTopic
  const recurringGroups = (() => {
    const recurring = tasks.filter(t => t.taskType === 'recurring');
    if (!recurring.length) return [];
    const map = {};
    recurring.forEach(t => {
      const topic = t.recurringTopic || '(ללא שם נושא)';
      if (!map[topic]) map[topic] = [];
      map[topic].push(t);
    });
    return Object.entries(map).map(([topic, list]) => {
      const open = list
        .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
        .sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
      return { topic, next: open[0] || null };
    }).sort((a, b) => a.topic.localeCompare(b.topic));
  })();

  const byStatus = (s) => projects.filter(p => p.status === s).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">לוח בקרה</h1>
          <p className="text-slate-500 text-sm mt-0.5">סקירה כללית של הפרויקטים והמשימות שלך</p>
        </div>
        <button
          onClick={() => openModal('task','create')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          משימה חדשה
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderOpen}    label="פרויקטים פעילים"  value={byStatus('active')}       color="indigo" />
        <StatCard icon={AlertCircle}   label="באיחור"           value={overdue.length}            color="red"    sub={overdue.length ? 'דורש טיפול מיידי' : undefined} />
        <StatCard icon={Clock}         label="להיום"            value={dueToday.length}           color="orange" />
        <StatCard icon={CheckCircle2}  label="הושלמו"           value={completedAll.length}       color="green"  sub="סה״כ" />
      </div>

      {/* Urgent + Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Urgent */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <h2 className="font-semibold text-slate-800 text-sm">דחוף ומיידי</h2>
              {(urgent.length + urgentFollowUpTasks.length + urgentGeneralFollowUps.length) > 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {urgent.length + urgentFollowUpTasks.length + urgentGeneralFollowUps.length}
                </span>
              )}
            </div>
            <button onClick={() => { setCurrentPage('tasks'); }} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              הכל <ArrowLeft size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {urgent.length === 0 && urgentFollowUpTasks.length === 0 && urgentGeneralFollowUps.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">אין משימות דחופות 🎉</p>
            ) : (
              <>
                {urgent.slice(0,5).map(t => (
                  <TaskRow key={t.id} task={t} project={getProject(t.projectId)} onEdit={t => openModal('task','edit',t)} />
                ))}
                {urgentFollowUpTasks.map(t => (
                  <FollowUpRow
                    key={`fu-${t.id}`}
                    title={t.title}
                    subtitle={getProject(t.projectId)?.name}
                    date={t.followUp.date}
                    onEdit={() => openModal('task','edit',t)}
                  />
                ))}
                {urgentGeneralFollowUps.map(g => (
                  <FollowUpRow
                    key={`gfu-${g.id}`}
                    title={g.note || 'פולואו-אפ כללי'}
                    subtitle={getProject(g.projectId)?.name}
                    date={g.date}
                    onEdit={() => setCurrentPage('followups')}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Coming soon */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <h2 className="font-semibold text-slate-800 text-sm">השבוע הקרוב</h2>
              {dueSoon.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">{dueSoon.length}</span>
              )}
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {dueSoon.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">אין משימות לשבוע הקרוב</p>
            ) : dueSoon.slice(0,5).map(t => (
              <TaskRow key={t.id} task={t} project={getProject(t.projectId)} onEdit={t => openModal('task','edit',t)} />
            ))}
          </div>
        </div>
      </div>

      {/* Follow-ups today */}
      {followUpsToday.length > 0 && (
        <div className="bg-white rounded-xl border border-violet-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-violet-100 bg-violet-50/60">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-violet-600" />
              <h2 className="font-semibold text-violet-900 text-sm">פולואו-אפים להיום</h2>
              <span className="bg-violet-100 text-violet-700 text-xs px-2 py-0.5 rounded-full font-medium">{followUpsToday.length}</span>
            </div>
            <button onClick={() => setCurrentPage('followups')} className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1">
              כל הפולואו-אפים <ArrowLeft size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {followUpsToday.map(t => {
              const proj = getProject(t.projectId);
              const pri  = PRIORITIES[t.priority];
              return (
                <button
                  key={t.id}
                  onClick={() => openModal('task','edit',t)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50/40 text-right transition-colors"
                >
                  <Bell size={14} className="text-violet-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                    {t.followUp?.note && <p className="text-xs text-slate-500 truncate">{t.followUp.note}</p>}
                    {proj && <p className="text-xs text-slate-400 truncate">{proj.name}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${pri?.bgClass}`}>{pri?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recurring topics */}
      {recurringGroups.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
            <RefreshCw size={16} className="text-teal-500" />
            <h2 className="font-semibold text-slate-800 text-sm">נושאים שוטפים</h2>
            <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">{recurringGroups.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {recurringGroups.map(({ topic, next }) => {
              const pri = next ? PRIORITIES[next.priority] : null;
              const rel = next?.dueDate ? getRelativeLabel(next.dueDate) : null;
              const relColor =
                rel?.type === 'overdue' ? 'text-red-600 font-semibold' :
                rel?.type === 'today'   ? 'text-orange-600 font-semibold' :
                rel?.type === 'soon'    ? 'text-amber-600' : 'text-slate-400';
              return (
                <div key={topic} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-teal-700 truncate">{topic}</p>
                    {next
                      ? <p className="text-sm text-slate-700 truncate mt-0.5">{next.title}</p>
                      : <p className="text-xs text-slate-400 mt-0.5 italic">אין משימות פתוחות</p>
                    }
                  </div>
                  {next && (
                    <div className="flex items-center gap-2 shrink-0">
                      {rel && <span className={`text-xs ${relColor}`}>{rel.text}</span>}
                      {pri && <span className={`text-xs px-2 py-0.5 rounded-full ${pri.bgClass}`}>{pri.label}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800 text-sm">פרויקטים</h2>
          </div>
          <button onClick={() => setCurrentPage('projects')} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            כל הפרויקטים <ArrowLeft size={12} />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {projects.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">אין פרויקטים עדיין</p>
          ) : projects.slice(0,5).map(proj => {
            const pTasks  = tasks.filter(t => t.projectId === proj.id);
            const pDone   = pTasks.filter(t => t.status === 'completed').length;
            const pActive = pTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
            const pct     = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0;
            const st      = PROJECT_STATUSES[proj.status];
            return (
              <button key={proj.id} onClick={() => navigateToProject(proj.id)} className="flex items-center gap-4 px-4 py-3 w-full text-right hover:bg-indigo-50/50 transition-colors cursor-pointer">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: proj.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{proj.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st?.bgClass}`}>{st?.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{pDone}/{pTasks.length}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{pActive} פתוחות</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
