import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from './utils/supabaseClient';
import LoginPage from './components/Auth/LoginPage';
import ResetPasswordPage from './components/Auth/ResetPasswordPage';
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

const PAGE_TITLES = {
  dashboard:      'לוח בקרה',
  projects:       'פרויקטים',
  'project-detail': 'פרויקט',
  tasks:          'כל המשימות',
  followups:      'פולואו-אפ',
  calendar:       'לוז',
  review:         'סקירה שבועית',
};

function AppContent() {
  const { currentPage, modal, loading, setSidebarOpen } = useApp();

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
      case 'dashboard':      return <Dashboard />;
      case 'review':         return <ReviewPage />;
      case 'projects':       return <ProjectList />;
      case 'project-detail': return <ProjectDetail />;
      case 'tasks':          return <TaskList />;
      case 'calendar':       return <CalendarView />;
      case 'followups':      return <FollowUps />;
      default:               return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar — hidden on desktop */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-1 rounded-lg hover:bg-slate-100 text-slate-600 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="פתח תפריט"
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold text-slate-800">
            {PAGE_TITLES[currentPage] || 'מנהל פרויקטים'}
          </span>
          {/* spacer to balance the hamburger */}
          <div className="w-10" />
        </header>

        <main key={currentPage} className="page-fade flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {modal?.type === 'project'  && <ProjectModal />}
      {modal?.type === 'task'     && <TaskModal />}
      {modal?.type === 'followup' && <FollowUpModal />}
      {modal?.type === 'general-followup-edit' && <GeneralFollowUpEditModal />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (recoveryMode) {
    return <ResetPasswordPage onDone={() => setRecoveryMode(false)} />;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}
