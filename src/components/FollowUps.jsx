import React, { useMemo, useState } from 'react';
import { Bell, Plus, Edit2, Calendar, FolderOpen, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { formatDateHe, getRelativeLabel, today } from '../utils/dateUtils';

function FollowUpCard({ task, project, isNext, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const pri = PRIORITIES[task.priority];
  const st  = TASK_STATUSES[task.status];
  const rel = getRelativeLabel(task.followUp.date);

  const relColor =
    rel?.type === 'overdue' ? 'text-red-600 font-semibold' :
    rel?.type === 'today'   ? 'text-violet-700 font-semibold' :
    rel?.type === 'soon'    ? 'text-amber-600' : 'text-slate-500';

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all overflow-hidden ${
      isNext
        ? 'border-violet-300 ring-2 ring-violet-100'
        : 'border-slate-200 hover:border-violet-200'
    }`}>
      {/* Next badge stripe */}
      {isNext && (
        <div className="bg-violet-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center gap-1.5">
          <Star size={11} fill="currentColor" />
          הבא בתור לפולואו-אפ
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isNext ? 'bg-violet-100' : 'bg-slate-100'
          }`}>
            <Bell size={17} className={isNext ? 'text-violet-600' : 'text-slate-400'} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Task title + badges */}
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-900 flex-1 min-w-0">{task.title}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pri?.bgClass}`}>{pri?.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${st?.bgClass}`}>{st?.label}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`text-xs flex items-center gap-1 ${relColor}`}>
                <Calendar size={11} />
                {rel?.text || formatDateHe(task.followUp.date)}
              </span>
              {project && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: project.color }} />
                  {project.name}
                </span>
              )}
              {task.followUp.note && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors"
                >
                  הערה
                  {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              )}
            </div>

            {/* Note expanded */}
            {expanded && task.followUp.note && (
              <div className="mt-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                <p className="text-xs text-violet-800 leading-relaxed whitespace-pre-wrap">{task.followUp.note}</p>
              </div>
            )}
          </div>

          <button
            onClick={onEdit}
            className="p-1.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors shrink-0"
          >
            <Edit2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'upcoming', label: 'קרובים'   },
  { id: 'today',    label: 'היום'     },
  { id: 'overdue',  label: 'באיחור'   },
  { id: 'all',      label: 'הכל'      },
];

export default function FollowUps() {
  const { tasks, projects, openModal } = useApp();
  const [tab, setTab] = useState('upcoming');

  const todayStr = today();

  // All tasks with a follow-up date, not cancelled/completed
  const allFollowUps = useMemo(() =>
    tasks
      .filter(t => t.followUp?.date && t.status !== 'cancelled')
      .sort((a, b) => a.followUp.date.localeCompare(b.followUp.date)),
    [tasks]
  );

  const getProject = (id) => projects.find(p => p.id === id);

  // "Next in line" = earliest follow-up that is today or in the future, not completed
  const nextFollowUp = useMemo(() =>
    allFollowUps.find(t =>
      t.followUp.date >= todayStr && t.status !== 'completed'
    ),
    [allFollowUps, todayStr]
  );

  const filtered = useMemo(() => {
    switch (tab) {
      case 'today':    return allFollowUps.filter(t => t.followUp.date === todayStr);
      case 'overdue':  return allFollowUps.filter(t => t.followUp.date < todayStr && t.status !== 'completed');
      case 'upcoming': return allFollowUps.filter(t => t.followUp.date >= todayStr && t.status !== 'completed');
      default:         return allFollowUps;
    }
  }, [allFollowUps, tab, todayStr]);

  const countFor = (t) => {
    switch (t) {
      case 'today':    return allFollowUps.filter(x => x.followUp.date === todayStr).length;
      case 'overdue':  return allFollowUps.filter(x => x.followUp.date < todayStr && x.status !== 'completed').length;
      case 'upcoming': return allFollowUps.filter(x => x.followUp.date >= todayStr && x.status !== 'completed').length;
      default:         return allFollowUps.length;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">פולואו-אפים</h1>
          <p className="text-slate-500 text-sm mt-0.5">{allFollowUps.length} פולואו-אפים בסך הכל</p>
        </div>
        <button
          onClick={() => openModal('task','create')}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          משימה חדשה
        </button>
      </div>

      {/* Next in line highlight (shown outside tabs) */}
      {nextFollowUp && tab !== 'today' && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
            <Star size={18} className="text-violet-600" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-0.5">הבא בתור לפולואו-אפ</p>
            <p className="text-sm font-semibold text-slate-900 truncate">{nextFollowUp.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-violet-700">{formatDateHe(nextFollowUp.followUp.date)}</span>
              {nextFollowUp.followUp.note && (
                <span className="text-xs text-slate-500 truncate">— {nextFollowUp.followUp.note}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => openModal('task','edit',nextFollowUp)}
            className="text-xs text-violet-600 hover:text-violet-800 font-medium shrink-0 px-3 py-1.5 bg-white border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
          >
            פתח
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-violet-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
            <span className="mr-1.5 text-xs opacity-70">({countFor(t.id)})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-slate-400">
          <Bell size={38} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium">אין פולואו-אפים בקטגוריה זו</p>
          <p className="text-sm mt-1">הוסף פולואו-אפ דרך עריכת משימה</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <FollowUpCard
              key={t.id}
              task={t}
              project={getProject(t.projectId)}
              isNext={t.id === nextFollowUp?.id}
              onEdit={() => openModal('task','edit',t)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
