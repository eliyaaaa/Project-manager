import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

const DEMO_COLOR = '#6366f1';
const DEMO_PROJECTS = [
  { id: 'p1', name: 'אתר חברה', description: 'פיתוח ועיצוב מחדש של אתר החברה', status: 'active', color: '#6366f1', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z' },
  { id: 'p2', name: 'אפליקציה מובייל', description: 'פיתוח אפליקציה ל-iOS ו-Android', status: 'active', color: '#8b5cf6', createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-03-18T10:00:00Z' },
  { id: 'p3', name: 'דוח שנתי 2025', description: 'הכנת הדוח השנתי של החברה', status: 'completed', color: '#22c55e', createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-03-10T10:00:00Z' },
];
const DEMO_TASKS = [
  { id: 't1', projectId: 'p1', title: 'עיצוב דף הבית', description: 'יצירת מוקאפ לדף הבית החדש', dueDate: '2026-03-29', priority: 'high', status: 'in-progress', subtasks: [{ id: 's1', title: 'סקיצה ראשונית', completed: true },{ id: 's2', title: 'משוב מהלקוח', completed: false }], createdAt: '2026-03-10T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z' },
  { id: 't2', projectId: 'p1', title: 'פיתוח ממשק ניווט', description: 'בניית תפריט ניווט רספונסיבי', dueDate: '2026-04-05', priority: 'medium', status: 'todo', subtasks: [], createdAt: '2026-03-12T10:00:00Z', updatedAt: '2026-03-12T10:00:00Z' },
  { id: 't3', projectId: 'p2', title: 'מסך כניסה למשתמש', description: 'הרשמה והתחברות עם אימות דו-שלבי', dueDate: '2026-03-28', priority: 'high', status: 'todo', subtasks: [{ id: 's3', title: 'UI Design', completed: true },{ id: 's4', title: 'Backend API', completed: false },{ id: 's5', title: 'Testing', completed: false }], createdAt: '2026-03-05T10:00:00Z', updatedAt: '2026-03-05T10:00:00Z' },
  { id: 't4', projectId: 'p2', title: 'דחיפת התראות', description: 'מערכת push notifications', dueDate: '2026-04-15', priority: 'low', status: 'todo', subtasks: [], createdAt: '2026-03-08T10:00:00Z', updatedAt: '2026-03-08T10:00:00Z' },
  { id: 't5', projectId: 'p3', title: 'סיכום נתונים פיננסיים', description: '', dueDate: '2026-03-15', priority: 'high', status: 'completed', subtasks: [], createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-03-14T10:00:00Z' },
];

export function AppProvider({ children }) {
  const [projects, setProjects] = useState(() => load('pm_projects', DEMO_PROJECTS));
  const [tasks, setTasks]       = useState(() => load('pm_tasks', DEMO_TASKS));
  const [generalFollowUps, setGeneralFollowUps] = useState(() => load('pm_general_followups', []));
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [modal, setModal]       = useState(null); // { type, mode, data, defaults }
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [taskFilters, setTaskFilters] = useState({ search: '', projectId: '', priority: '', status: '' });
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => { localStorage.setItem('pm_projects',          JSON.stringify(projects));          }, [projects]);
  useEffect(() => { localStorage.setItem('pm_tasks',             JSON.stringify(tasks));             }, [tasks]);
  useEffect(() => { localStorage.setItem('pm_general_followups', JSON.stringify(generalFollowUps)); }, [generalFollowUps]);

  // --- Projects ---
  const addProject = useCallback((data) => {
    const p = { id: genId(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setProjects(prev => [p, ...prev]);
    return p;
  }, []);

  const updateProject = useCallback((id, data) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
  }, []);

  // --- Tasks ---
  const addTask = useCallback((data) => {
    const t = { id: genId(), ...data, subtasks: data.subtasks || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setTasks(prev => [t, ...prev]);
    return t;
  }, []);

  const updateTask = useCallback((id, data) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskDone = useCallback((id) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed', updatedAt: new Date().toISOString() } : t
    ));
  }, []);

  // --- Subtasks ---
  const addSubtask = useCallback((taskId, title) => {
    const s = { id: genId(), title, completed: false };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks||[]), s] } : t));
  }, []);

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s) }
        : t
    ));
  }, []);

  const updateSubtask = useCallback((taskId, subtaskId, title) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, title } : s) }
        : t
    ));
  }, []);

  const deleteSubtask = useCallback((taskId, subtaskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) } : t
    ));
  }, []);

  // --- General follow-ups ---
  const addGeneralFollowUp = useCallback((data) => {
    const gf = { id: genId(), ...data, createdAt: new Date().toISOString() };
    setGeneralFollowUps(prev => [...prev, gf]);
  }, []);

  const updateGeneralFollowUp = useCallback((id, data) => {
    setGeneralFollowUps(prev => prev.map(gf => gf.id === id ? { ...gf, ...data } : gf));
  }, []);

  const deleteGeneralFollowUp = useCallback((id) => {
    setGeneralFollowUps(prev => prev.filter(gf => gf.id !== id));
  }, []);

  // --- Modals ---
  const openModal  = useCallback((type, mode = 'create', data = null, defaults = {}) => setModal({ type, mode, data, defaults }), []);
  const closeModal = useCallback(() => setModal(null), []);

  // --- Navigation to project detail ---
  const navigateToProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project-detail');
  }, []);

  return (
    <AppContext.Provider value={{
      projects, tasks, generalFollowUps,
      addGeneralFollowUp, updateGeneralFollowUp, deleteGeneralFollowUp,
      currentPage, setCurrentPage,
      selectedProjectId, navigateToProject,
      modal, openModal, closeModal,
      taskFilters, setTaskFilters,
      projectFilter, setProjectFilter,
      addProject, updateProject, deleteProject,
      addTask, updateTask, deleteTask, toggleTaskDone,
      addSubtask, toggleSubtask, updateSubtask, deleteSubtask,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
