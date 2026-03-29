import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, MoreVertical, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROJECT_STATUSES } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';

const FILTERS = [
  { id: '', label: 'הכל' },
  { id: 'active',    label: 'פעיל'       },
  { id: 'paused',    label: 'מושהה'      },
  { id: 'reference', label: 'בהתייחסות'  },
  { id: 'completed', label: 'הושלם'      },
];

function ProjectCard({ project, tasks, onEdit, onDelete }) {
  const [menu, setMenu] = useState(false);
  const pTasks   = tasks.filter(t => t.projectId === project.id);
  const done     = pTasks.filter(t => t.status === 'completed').length;
  const active   = pTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
  const pct      = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
  const st       = PROJECT_STATUSES[project.status];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Color stripe */}
      <div className="h-1.5 w-full" style={{ background: project.color }} />

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: project.color + '22' }}>
              <FolderOpen size={15} style={{ color: project.color }} />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate">{project.name}</h3>
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <button onClick={() => setMenu(v => !v)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <MoreVertical size={15} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute left-0 top-7 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                  <button onClick={() => { onEdit(project); setMenu(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-right">
                    <Edit2 size={13} /> עריכה
                  </button>
                  <button onClick={() => { onDelete(project.id); setMenu(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-right">
                    <Trash2 size={13} /> מחיקה
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${st?.bgClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st?.dotClass}`} />
            {st?.label}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{project.description}</p>
        )}

        {/* Progress */}
        <div className="mt-auto space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{pct}% הושלם</span>
            <span>{done}/{pTasks.length} משימות</span>
          </div>
          <div className="bg-slate-100 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: project.color }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-50">
          <span className="flex items-center gap-1"><CheckSquare size={11} /> {active} פתוחות</span>
          <span>עודכן {formatDate(project.updatedAt?.slice(0,10))}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectList() {
  const { projects, tasks, openModal, deleteProject, projectFilter, setProjectFilter } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = projectFilter ? projects.filter(p => p.status === projectFilter) : projects;

  const handleDelete = (id) => {
    const taskCount = tasks.filter(t => t.projectId === id).length;
    setConfirmDelete({ id, taskCount });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">פרויקטים</h1>
          <p className="text-slate-500 text-sm mt-0.5">{projects.length} פרויקטים בסך הכל</p>
        </div>
        <button
          onClick={() => openModal('project','create')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          פרויקט חדש
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setProjectFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              projectFilter === f.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
            <span className="mr-1.5 text-xs opacity-70">
              ({f.id ? projects.filter(p => p.status === f.id).length : projects.length})
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">אין פרויקטים</p>
          <p className="text-sm mt-1">לחץ על "פרויקט חדש" כדי להתחיל</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              tasks={tasks}
              onEdit={proj => openModal('project','edit',proj)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-slate-900 text-lg mb-2">מחיקת פרויקט</h3>
            <p className="text-slate-600 text-sm mb-1">האם אתה בטוח שברצונך למחוק את הפרויקט?</p>
            {confirmDelete.taskCount > 0 && (
              <p className="text-red-600 text-sm font-medium">⚠️ {confirmDelete.taskCount} משימות ימחקו גם כן</p>
            )}
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                ביטול
              </button>
              <button
                onClick={() => { deleteProject(confirmDelete.id); setConfirmDelete(null); }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
