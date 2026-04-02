import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import FollowUps from './components/FollowUps';
import ReviewPage from './components/ReviewPage';
import ProjectModal from './components/modals/ProjectModal';
import TaskModal from './components/modals/TaskModal';
import FollowUpModal from './components/modals/FollowUpModal';
import GeneralFollowUpEditModal from './components/modals/GeneralFollowUpEditModal';
import ToastContainer from './components/ToastContainer';

function AppContent() {
  const { currentPage, modal, loading } = useApp();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'review':    return <ReviewPage />;
      case 'projects':        return <ProjectList />;
      case 'project-detail':  return <ProjectDetail />;
      case 'tasks':           return <TaskList />;
      case 'calendar':   return <CalendarView />;
      case 'followups':  return <FollowUps />;
      default:           return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <Sidebar />
      <main key={currentPage} className="page-fade flex-1 overflow-y-auto">
        {renderPage()}
      </main>
      {modal?.type === 'project'  && <ProjectModal />}
      {modal?.type === 'task'     && <TaskModal />}
      {modal?.type === 'followup' && <FollowUpModal />}
      {modal?.type === 'general-followup-edit' && <GeneralFollowUpEditModal />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}
