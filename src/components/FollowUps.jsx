import React, { useMemo, useState } from 'react';
import { Bell, Edit2, Calendar, ChevronDown, ChevronUp, Star, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { formatDateHe, getRelativeLabel, today } from '../utils/dateUtils';

function FollowUpCard({ task, project, isNext, onEdit, onDelete }) {
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

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
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

function GeneralFollowUpCard({ gf, project, isNext, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const rel = getRelativeLabel(gf.date);
  const relColor =
    rel?.type === 'overdue' ? 'text-red-600 font-semibold' :
    rel?.type === 'today'   ? 'text-violet-700 font-semibold' :
    rel?.type === 'soon'    ? 'text-amber-600' : 'text-slate-500';

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
      isNext ? 'border-violet-300 ring-2 ring-violet-100' : 'border-slate-200 hover:border-violet-200'
    }`}>
      {isNext && (
        <div className="bg-violet-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center gap-1.5">
          <Star size={11} fill="currentColor" />
          הבא בתור לפולואו-אפ
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isNext ? 'bg-violet-100' : 'bg-slate-100'}`}>
            <Bell size={17} className={isNext ? 'text-violet-600' : 'text-slate-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex-1">{gf.title || 'כללי'}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">ללא משימה</span>
                {gf.status === 'done' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">בוצע</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={`text-xs flex items-center gap-1 ${relColor}`}>
                <Calendar size={11} />
                {rel?.text || formatDateHe(gf.date)}
              </span>
              {project && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: project.color }} />
                  {project.name}
                </span>
              )}
              {gf.note && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors"
                >
                  הערה {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              )}
            </div>
            {expanded && gf.note && (
              <div className="mt-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                <p className="text-xs text-violet-800 leading-relaxed whitespace-pre-wrap">{gf.note}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FollowUps() {
  const { tasks, projects, generalFollowUps, deleteGeneralFollowUp, updateTask, openModal } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState('upcoming');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const todayStr = today();
  const getProject = (id) => projects.find(p => p.id === id);

  // Task follow-ups (normalized)
  const taskFollowUps = useMemo(() =>
    tasks
      .filter(t => t.followUp?.date && t.status !== 'cancelled')
      .sort((a, b) => a.followUp.date.localeCompare(b.followUp.date)),
    [tasks]
  );

  // General follow-ups sorted (only those with a date, consistent with taskFollowUps)
  const sortedGeneral = useMemo(() =>
    generalFollowUps
      .filter(g => g.date)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [generalFollowUps]
  );

  // Unified list for "next in line" calculation (task follow-ups + general, sorted by date)
  const allFollowUpDates = useMemo(() => [
    ...taskFollowUps.map(t => ({ kind: 'task', id: t.id, date: t.followUp.date, status: t.status })),
    ...sortedGeneral.map(g => ({ kind: 'general', id: g.id, date: g.date, status: null })),
  ].sort((a, b) => a.date.localeCompare(b.date)), [taskFollowUps, sortedGeneral]);

  const nextItem = useMemo(() =>
    allFollowUpDates.find(x => x.date >= todayStr && x.status !== 'completed'),
    [allFollowUpDates, todayStr]
  );

  // For "next in line" banner — find the actual object
  const nextFollowUpTask    = nextItem?.kind === 'task'    ? tasks.find(t => t.id === nextItem.id)           : null;
  const nextFollowUpGeneral = nextItem?.kind === 'general' ? generalFollowUps.find(g => g.id === nextItem.id) : null;

  const filterTask = (list) => {
    switch (tab) {
      case 'today':    return list.filter(t => t.followUp.date === todayStr);
      case 'overdue':  return list.filter(t => t.followUp.date < todayStr && t.status !== 'completed');
      case 'upcoming': return list.filter(t => t.followUp.date >= todayStr && t.status !== 'completed');
      default:         return list;
    }
  };

  const filterGeneral = (list) => {
    switch (tab) {
      case 'today':    return list.filter(g => g.date === todayStr);
      case 'overdue':  return list.filter(g => g.date < todayStr);
      case 'upcoming': return list.filter(g => g.date >= todayStr);
      default:         return list;
    }
  };

  const filteredTasks   = filterTask(taskFollowUps);
  const filteredGeneral = filterGeneral(sortedGeneral);
  const totalFiltered   = filteredTasks.length + filteredGeneral.length;
  const totalAll        = taskFollowUps.length + sortedGeneral.length;

  const countFor = (t) => {
    switch (t) {
      case 'today':    return taskFollowUps.filter(x => x.followUp.date === todayStr).length + sortedGeneral.filter(g => g.date === todayStr).length;
      case 'overdue':  return taskFollowUps.filter(x => x.followUp.date < todayStr && x.status !== 'completed').length + sortedGeneral.filter(g => g.date < todayStr).length;
      case 'upcoming': return taskFollowUps.filter(x => x.followUp.date >= todayStr && x.status !== 'completed').length + sortedGeneral.filter(g => g.date >= todayStr).length;
      default:         return totalAll;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">פולואו-אפים</h1>
          <p className="text-slate-500 text-sm mt-0.5">{totalAll} פולואו-אפים בסך הכל</p>
        </div>
        <button
          onClick={() => openModal('followup')}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Bell size={16} />
          פולואו-אפ חדש
        </button>
      </div>

      {/* Next in line highlight */}
      {nextItem && tab !== 'today' && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
            <Star size={18} className="text-violet-600" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-0.5">הבא בתור לפולואו-אפ</p>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {nextFollowUpTask ? nextFollowUpTask.title : 'כללי'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-violet-700">
                {formatDateHe(nextFollowUpTask ? nextFollowUpTask.followUp.date : nextFollowUpGeneral.date)}
              </span>
              {(nextFollowUpTask?.followUp?.note || nextFollowUpGeneral?.note) && (
                <span className="text-xs text-slate-500 truncate">
                  — {nextFollowUpTask?.followUp?.note || nextFollowUpGeneral?.note}
                </span>
              )}
            </div>
          </div>
          {nextFollowUpTask && (
            <button
              onClick={() => openModal('task','edit',nextFollowUpTask)}
              className="text-xs text-violet-600 hover:text-violet-800 font-medium shrink-0 px-3 py-1.5 bg-white border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
            >
              פתח
            </button>
          )}
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
      {totalFiltered === 0 ? (
        <div className="text-center py-14 text-slate-400">
          <Bell size={38} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium">אין פולואו-אפים בקטגוריה זו</p>
          <p className="text-sm mt-1">הוסף פולואו-אפ דרך כפתור "פולואו-אפ חדש"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Merge and sort by date */}
          {[
            ...filteredTasks.map(t => ({ kind: 'task', date: t.followUp.date, obj: t })),
            ...filteredGeneral.map(g => ({ kind: 'general', date: g.date, obj: g })),
          ]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(item =>
              item.kind === 'task' ? (
                <FollowUpCard
                  key={item.obj.id}
                  task={item.obj}
                  project={getProject(item.obj.projectId)}
                  isNext={nextItem?.kind === 'task' && item.obj.id === nextItem.id}
                  onEdit={() => openModal('task','edit',item.obj)}
                  onDelete={() => setConfirmDelete(() => () => { updateTask(item.obj.id, { followUp: null }); showToast('פולואו-אפ נמחק'); })}
                />
              ) : (
                <GeneralFollowUpCard
                  key={item.obj.id}
                  gf={item.obj}
                  project={getProject(item.obj.projectId)}
                  isNext={nextItem?.kind === 'general' && item.obj.id === nextItem.id}
                  onEdit={() => openModal('general-followup-edit', 'edit', item.obj)}
                  onDelete={() => setConfirmDelete(() => () => { deleteGeneralFollowUp(item.obj.id); showToast('פולואו-אפ נמחק'); })}
                />
              )
            )
          }
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-slate-900 text-lg mb-2">מחיקת פולואו-אפ</h3>
            <p className="text-slate-600 text-sm">האם אתה בטוח שברצונך למחוק פולואו-אפ זה?</p>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">ביטול</button>
              <button onClick={() => { confirmDelete(); setConfirmDelete(null); }} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">מחק</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
