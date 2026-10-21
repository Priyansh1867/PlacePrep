import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import BatchSelectionModal from './components/BatchSelectionModal';
import AuthModal from './components/AuthModal';
import GlobalSearchModal from './components/GlobalSearchModal';

// Pages
import HomePage from './pages/HomePage';
import PlacementDrivesPage from './pages/PlacementDrivesPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyHubPage from './pages/CompanyHubPage';
import QuestionPrepPage from './pages/QuestionPrepPage';
import ExperiencesPage from './pages/ExperiencesPage';
import AiInsightsPage from './pages/AiInsightsPage';
import MockInterviewPage from './pages/MockInterviewPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AdminPage from './pages/AdminPage';
import SelectionWorkflowPage from './pages/SelectionWorkflowPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import DsaPracticePage from './pages/DsaPracticePage';
import RevisionPage from './pages/RevisionPage';
import CoreCsPage from './pages/CoreCsPage';

import { 
  isOnboardingCompleted, 
  getGraduationBatch, 
  getCompanies, 
  getCurrentUser,
  clearCurrentUser,
  setCurrentUser
} from './services/storage';
import { AuthApi } from './services/api';

const ROUTE_HASH_MAP = {
  'home': '',
  'dashboard': '#dashboard',
  'companies': '#companies',
  'company-hub': '#company-hub',
  'drives': '#drives',
  'applications': '#applications',
  'dsa': '#dsa',
  'core-cs': '#core-cs',
  'aptitude': '#aptitude',
  'prep': '#prep',
  'mock-interview': '#mock-interview',
  'experiences': '#experiences',
  'workflow': '#workflow',
  'ai-insights': '#ai-insights',
  'revision': '#revision',
  'admin': '#admin'
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    return hash || 'home';
  });

  const [currentUserState, setCurrentUserState] = useState(getCurrentUser());
  const [currentBatch, setCurrentBatch] = useState(getGraduationBatch());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedRoundType, setSelectedRoundType] = useState('technical');
  const [mockSessionParams, setMockSessionParams] = useState({ company: null, round: 'technical' });

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Hash change synchronization for back/forward and deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (hash && hash !== currentRoute) {
        setCurrentRoute(hash);
      } else if (!hash && currentRoute !== 'home') {
        setCurrentRoute('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoute]);

  const navigateTo = (routeId) => {
    setCurrentRoute(routeId);
    const targetHash = ROUTE_HASH_MAP[routeId] ?? (routeId === 'home' ? '' : `#${routeId}`);
    if (window.location.hash !== targetHash) {
      if (targetHash === '') {
        window.history.pushState(null, '', window.location.pathname);
      } else {
        window.location.hash = targetHash;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to auth and batch storage events
  useEffect(() => {
    const handleAuthChange = (e) => setCurrentUserState(e.detail);
    const handleBatchChange = (e) => setCurrentBatch(e.detail);

    window.addEventListener('auth-state-changed', handleAuthChange);
    window.addEventListener('batch-changed', handleBatchChange);

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
      window.removeEventListener('batch-changed', handleBatchChange);
    };
  }, []);

  // Check onboarding on mount
  useEffect(() => {
    const onboardingDone = isOnboardingCompleted();
    if (!onboardingDone) {
      setIsBatchModalOpen(true);
    }
  }, []);

  // Global Keyboard shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Navigation handlers
  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    navigateTo('company-hub');
  };

  const handleSelectRound = (roundId, company) => {
    setSelectedRoundType(roundId);
    setSelectedCompany(company);
    setSelectedQuestion(null);
    navigateTo('prep');
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setSelectedRoundType(question.round || 'technical');
    const companies = getCompanies();
    const foundCompany = companies.find(c => c.id === question.companyId);
    if (foundCompany) setSelectedCompany(foundCompany);
    navigateTo('prep');
  };

  const handleStartMockInterview = (company, round = 'technical') => {
    setMockSessionParams({ company, round });
    navigateTo('mock-interview');
  };

  const handleViewAiInsights = (company) => {
    setSelectedCompany(company);
    navigateTo('ai-insights');
  };

  const handleSearchSelect = (resultItem) => {
    if (resultItem.type === 'company') {
      handleSelectCompany(resultItem.data);
    } else if (resultItem.type === 'question') {
      handleSelectQuestion(resultItem.data);
    } else if (resultItem.type === 'drive') {
      navigateTo('drives');
    } else if (resultItem.type === 'experience') {
      navigateTo('experiences');
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    AuthApi.logout();
    navigateTo('home');
  };

  const handleDemoLogin = async (role = 'student') => {
    try {
      const res = await AuthApi.demoLogin(role);
      setCurrentUser(res.user);
      navigateTo('dashboard');
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    }
  };

  const showSidebar = currentRoute !== 'home';

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      
      {/* Persistent Desktop Sidebar (Hidden on landing page, visible on app pages) */}
      {showSidebar && (
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={currentUserState}
          batch={currentBatch}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
          onLogout={handleLogout}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Navigation Header */}
        <Navbar
          currentRoute={currentRoute}
          setCurrentRoute={navigateTo}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          user={currentUserState}
          batch={currentBatch}
          onLogout={handleLogout}
          onDemoLogin={handleDemoLogin}
        />

        {/* Dynamic Route View */}
        <main className="flex-1">
          {currentRoute === 'home' && (
            <HomePage
              onNavigate={navigateTo}
              onSelectCompany={handleSelectCompany}
              onSelectQuestion={handleSelectQuestion}
            />
          )}

          {currentRoute === 'dashboard' && (
            <StudentDashboardPage
              onNavigate={navigateTo}
              onSelectCompany={handleSelectCompany}
              onSelectQuestion={handleSelectQuestion}
            />
          )}

          {currentRoute === 'companies' && (
            <CompaniesPage
              onSelectCompany={handleSelectCompany}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
            />
          )}

          {currentRoute === 'company-hub' && (
            <CompanyHubPage
              company={selectedCompany || { id: 'hcltech', name: 'HCLTech' }}
              onBack={() => navigateTo('companies')}
              onSelectRound={handleSelectRound}
              onSelectQuestion={handleSelectQuestion}
              onStartMockInterview={handleStartMockInterview}
              onViewInsights={handleViewAiInsights}
            />
          )}

          {currentRoute === 'drives' && (
            <PlacementDrivesPage
              onSelectCompany={handleSelectCompany}
              onNavigate={navigateTo}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentRoute === 'applications' && (
            <MyApplicationsPage
              onNavigate={navigateTo}
              onSelectCompany={handleSelectCompany}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentRoute === 'dsa' && (
            <DsaPracticePage
              onSelectQuestion={handleSelectQuestion}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'core-cs' && (
            <CoreCsPage
              onSelectQuestion={handleSelectQuestion}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'aptitude' && (
            <QuestionPrepPage
              initialQuestion={selectedQuestion}
              roundType="technical"
              companyId={selectedCompany?.id}
              onBack={() => navigateTo('dashboard')}
              onNavigateToMock={(company, round) => handleStartMockInterview(company, round)}
            />
          )}

          {currentRoute === 'prep' && (
            <QuestionPrepPage
              initialQuestion={selectedQuestion}
              roundType={selectedRoundType}
              companyId={selectedCompany?.id}
              onBack={() => {
                if (selectedCompany) navigateTo('company-hub');
                else navigateTo('dashboard');
              }}
              onNavigateToMock={(company, round) => handleStartMockInterview(company, round)}
            />
          )}

          {currentRoute === 'revision' && (
            <RevisionPage
              onSelectQuestion={handleSelectQuestion}
              onNavigate={navigateTo}
            />
          )}

          {currentRoute === 'experiences' && (
            <ExperiencesPage />
          )}

          {currentRoute === 'workflow' && (
            <SelectionWorkflowPage
              onNavigate={navigateTo}
              onSelectQuestion={handleSelectQuestion}
            />
          )}

          {currentRoute === 'ai-insights' && (
            <AiInsightsPage
              initialCompanyId={selectedCompany?.id || 'hcltech'}
              onSelectQuestion={handleSelectQuestion}
              onLaunchMock={handleStartMockInterview}
            />
          )}

          {currentRoute === 'mock-interview' && (
            <MockInterviewPage
              initialCompany={mockSessionParams.company || selectedCompany}
              initialRound={mockSessionParams.round || 'technical'}
              onFinish={() => navigateTo('dashboard')}
            />
          )}

          {currentRoute === 'admin' && (
            <AdminPage />
          )}
        </main>

        {/* Footer */}
        <Footer onNavigate={navigateTo} />
      </div>

      {/* Graduation Batch Selection Modal */}
      <BatchSelectionModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchSelected={(batch) => setCurrentBatch(batch)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUserState(user);
          navigateTo('dashboard');
        }}
        triggerBatchModal={() => setIsBatchModalOpen(true)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectResult={handleSearchSelect}
      />

    </div>
  );
}
