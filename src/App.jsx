import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
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

function AppContent() {
  const { currentPage, modal } = useApp();

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
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
      {modal?.type === 'project'  && <ProjectModal />}
      {modal?.type === 'task'     && <TaskModal />}
      {modal?.type === 'followup' && <FollowUpModal />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
