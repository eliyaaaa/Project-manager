import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

const AppContext = createContext(null);

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

// Convert Supabase rows (snake_case) → app objects (camelCase)
const toProject = (row) => ({
  id:          row.id,
  name:        row.name,
  description: row.description,
  status:      row.status,
  color:       row.color,
  createdAt:   row.created_at,
  updatedAt:   row.updated_at,
});

const toTask = (row) => ({
  id:             row.id,
  projectId:      row.project_id,
  title:          row.title,
  description:    row.description,
  dueDate:        row.due_date,
  priority:       row.priority,
  status:         row.status,
  taskType:       row.task_type,
  recurringTopic: row.recurring_topic,
  assignee:       row.assignee,
  notes:          row.notes,
  subtasks:       row.subtasks || [],
  followUp:       row.follow_up,
  createdAt:      row.created_at,
  updatedAt:      row.updated_at,
});

const toGeneralFollowUp = (row) => ({
  id:        row.id,
  title:     row.title,
  date:      row.date,
  note:      row.note,
  status:    row.status,
  createdAt: row.created_at,
});

export function AppProvider({ children }) {
  const [projects,         setProjects]         = useState([]);
  const [tasks,            setTasks]            = useState([]);
  const [generalFollowUps, setGeneralFollowUps] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [currentPage,      setCurrentPage]      = useState('dashboard');
  const [modal,            setModal]            = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [taskFilters,      setTaskFilters]      = useState({ search: '', projectId: '', priority: '', status: '' });
  const [projectFilter,    setProjectFilter]    = useState('');

  // Load all data from Supabase on mount
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [{ data: p }, { data: t }, { data: g }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('general_follow_ups').select('*').order('created_at', { ascending: false }),
      ]);
      setProjects((p || []).map(toProject));
      setTasks((t || []).map(toTask));
      setGeneralFollowUps((g || []).map(toGeneralFollowUp));
      setLoading(false);
    }
    fetchAll();
  }, []);

  // --- Projects ---
  const addProject = useCallback(async (data) => {
    const now = new Date().toISOString();
    const row = {
      id:          genId(),
      name:        data.name,
      description: data.description || null,
      status:      data.status || 'active',
      color:       data.color || null,
      created_at:  now,
      updated_at:  now,
    };
    const { data: inserted, error } = await supabase.from('projects').insert(row).select().single();
    if (!error) setProjects(prev => [toProject(inserted), ...prev]);
    return inserted ? toProject(inserted) : null;
  }, []);

  const updateProject = useCallback(async (id, data) => {
    const now = new Date().toISOString();
    const row = {
      ...(data.name        !== undefined && { name:        data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status      !== undefined && { status:      data.status }),
      ...(data.color       !== undefined && { color:       data.color }),
      updated_at: now,
    };
    const { error } = await supabase.from('projects').update(row).eq('id', id);
    if (!error) setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: now } : p));
  }, []);

  const deleteProject = useCallback(async (id) => {
    // Delete tasks belonging to this project, then delete the project
    await supabase.from('tasks').delete().eq('project_id', id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.projectId !== id));
    }
  }, []);

  // --- Tasks ---
  const addTask = useCallback(async (data) => {
    const now = new Date().toISOString();
    const row = {
      id:              genId(),
      project_id:      data.projectId      || null,
      title:           data.title,
      description:     data.description    || null,
      due_date:        data.dueDate        || null,
      priority:        data.priority       || 'medium',
      status:          data.status         || 'todo',
      task_type:       data.taskType       || 'regular',
      recurring_topic: data.recurringTopic || null,
      assignee:        data.assignee       || null,
      notes:           data.notes          || null,
      subtasks:        data.subtasks       || [],
      follow_up:       data.followUp       || null,
      created_at:      now,
      updated_at:      now,
    };
    const { data: inserted, error } = await supabase.from('tasks').insert(row).select().single();
    if (!error) setTasks(prev => [toTask(inserted), ...prev]);
    return inserted ? toTask(inserted) : null;
  }, []);

  const updateTask = useCallback(async (id, data) => {
    const now = new Date().toISOString();
    const row = {
      ...(data.projectId      !== undefined && { project_id:      data.projectId }),
      ...(data.title          !== undefined && { title:           data.title }),
      ...(data.description    !== undefined && { description:     data.description }),
      ...(data.dueDate        !== undefined && { due_date:        data.dueDate }),
      ...(data.priority       !== undefined && { priority:        data.priority }),
      ...(data.status         !== undefined && { status:          data.status }),
      ...(data.taskType       !== undefined && { task_type:       data.taskType }),
      ...(data.recurringTopic !== undefined && { recurring_topic: data.recurringTopic }),
      ...(data.assignee       !== undefined && { assignee:        data.assignee }),
      ...(data.notes          !== undefined && { notes:           data.notes }),
      ...(data.subtasks       !== undefined && { subtasks:        data.subtasks }),
      ...(data.followUp       !== undefined && { follow_up:       data.followUp }),
      updated_at: now,
    };
    const { error } = await supabase.from('tasks').update(row).eq('id', id);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: now } : t));
  }, []);

  const deleteTask = useCallback(async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskDone = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const now = new Date().toISOString();
    const { error } = await supabase.from('tasks').update({ status: newStatus, updated_at: now }).eq('id', id);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, updatedAt: now } : t));
  }, [tasks]);

  // --- Subtasks (stored as JSON inside the task row) ---
  const addSubtask = useCallback(async (taskId, title) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const s = { id: genId(), title, completed: false };
    await updateTask(taskId, { subtasks: [...(task.subtasks || []), s] });
  }, [tasks, updateTask]);

  const toggleSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newSubtasks = task.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
    await updateTask(taskId, { subtasks: newSubtasks });
  }, [tasks, updateTask]);

  const updateSubtask = useCallback(async (taskId, subtaskId, title) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newSubtasks = task.subtasks.map(s => s.id === subtaskId ? { ...s, title } : s);
    await updateTask(taskId, { subtasks: newSubtasks });
  }, [tasks, updateTask]);

  const deleteSubtask = useCallback(async (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newSubtasks = task.subtasks.filter(s => s.id !== subtaskId);
    await updateTask(taskId, { subtasks: newSubtasks });
  }, [tasks, updateTask]);

  // --- General follow-ups ---
  const addGeneralFollowUp = useCallback(async (data) => {
    const now = new Date().toISOString();
    const row = {
      id:         genId(),
      title:      data.title  || null,
      date:       data.date,
      note:       data.note   || null,
      status:     data.status || 'pending',
      created_at: now,
    };
    const { data: inserted, error } = await supabase.from('general_follow_ups').insert(row).select().single();
    if (!error) setGeneralFollowUps(prev => [...prev, toGeneralFollowUp(inserted)]);
  }, []);

  const updateGeneralFollowUp = useCallback(async (id, data) => {
    const row = {
      ...(data.title  !== undefined && { title:  data.title }),
      ...(data.date   !== undefined && { date:   data.date }),
      ...(data.note   !== undefined && { note:   data.note }),
      ...(data.status !== undefined && { status: data.status }),
    };
    const { error } = await supabase.from('general_follow_ups').update(row).eq('id', id);
    if (!error) setGeneralFollowUps(prev => prev.map(gf => gf.id === id ? { ...gf, ...data } : gf));
  }, []);

  const deleteGeneralFollowUp = useCallback(async (id) => {
    const { error } = await supabase.from('general_follow_ups').delete().eq('id', id);
    if (!error) setGeneralFollowUps(prev => prev.filter(gf => gf.id !== id));
  }, []);

  // --- Modals ---
  const openModal  = useCallback((type, mode = 'create', data = null, defaults = {}) => setModal({ type, mode, data, defaults }), []);
  const closeModal = useCallback(() => setModal(null), []);

  // --- Navigation ---
  const navigateToProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project-detail');
  }, []);

  return (
    <AppContext.Provider value={{
      projects, tasks, generalFollowUps, loading,
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
