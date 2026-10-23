import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BatchSelectionModal from './components/BatchSelectionModal';
import AuthModal from './components/AuthModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import PushNotificationDrawer from './components/PushNotificationDrawer';

// Unified Portal Pages
import PortalGatewayPage from './pages/PortalGatewayPage';
import AuthPortalPage from './pages/AuthPortalPage';
import InstitutePortalPage from './pages/InstitutePortalPage';
import PlacementPortalPage from './pages/PlacementPortalPage';
import RemiiLandingPage from './pages/RemiiLandingPage';

// Specialized Placement Prep Pages
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
import AcademicRecordsPage from './pages/AcademicRecordsPage';
import DailyAttendancePage from './pages/DailyAttendancePage';
import CrtAttendancePage from './pages/CrtAttendancePage';
import ReportsExporterPage from './pages/ReportsExporterPage';
import CurriculumGovernancePage from './pages/CurriculumGovernancePage';
import DsaPracticePage from './pages/DsaPracticePage';

import { getCompanies } from './services/storage';

export default function App() {
  // Default to gateway (the Master Home Page with Institute & Placement options)
  const [currentRoute, setCurrentRoute] = useState('gateway');
  const [selectedAuthPortal, setSelectedAuthPortal] = useState('institute');
  const [authorizedPortal, setAuthorizedPortal] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedRoundType, setSelectedRoundType] = useState('technical');
  const [mockSessionParams, setMockSessionParams] = useState({ company: null, round: 'technical' });

  // Modals & Drawers
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Global Keyboard shortcuts
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
  const handleSelectPortal = (portal) => {
    if (authorizedPortal !== portal) {
      handleNavigateAuth(portal);
      return;
    }
    if (portal === 'institute') {
      setCurrentRoute('institute-portal');
    } else if (portal === 'placement') {
      setCurrentRoute('placement-portal');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAuth = (portalBranch = 'institute') => {
    setSelectedAuthPortal(portalBranch);
    setCurrentRoute('auth-portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user, portalBranch) => {
    setAuthorizedPortal(portalBranch);
    if (portalBranch === 'institute') {
      setCurrentRoute('institute-portal');
    } else if (portalBranch === 'placement') {
      setCurrentRoute('placement-portal');
    } else {
      setCurrentRoute('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setCurrentRoute('company-hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRound = (roundId, company) => {
    setSelectedRoundType(roundId);
    setSelectedCompany(company);
    setSelectedQuestion(null);
    setCurrentRoute('prep');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setSelectedRoundType(question.round);
    const companies = getCompanies();
    const foundCompany = companies.find(c => c.id === question.companyId);
    if (foundCompany) setSelectedCompany(foundCompany);
    setCurrentRoute('prep');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartMockInterview = (company, round = 'technical') => {
    setMockSessionParams({ company, round });
    setCurrentRoute('mock-interview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAiInsights = (company) => {
    setSelectedCompany(company);
    setCurrentRoute('ai-insights');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSelect = (resultItem) => {
    if (resultItem.type === 'company') {
      handleSelectCompany(resultItem.data);
    } else if (resultItem.type === 'question') {
      handleSelectQuestion(resultItem.data);
    } else if (resultItem.type === 'drive') {
      setCurrentRoute('drives');
    } else if (resultItem.type === 'experience') {
      setCurrentRoute('experiences');
    } else if (resultItem.type === 'academic-record') {
      setCurrentRoute('academic-records');
    }
  };

  // If route is 'landing', render standalone Remii-style Landing Page
  if (currentRoute === 'landing') {
    return (
      <RemiiLandingPage onBackToApp={() => setCurrentRoute('gateway')} />
    );
  }

  const isGuidedFlowRoute = ['gateway', 'home', 'auth-portal', 'institute-portal', 'placement-portal'].includes(currentRoute);

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans ${isGuidedFlowRoute ? 'bg-slate-950 text-white' : 'bg-[#F8F8F9] text-[#111439]'}`}>
      
      {!isGuidedFlowRoute && (
        <Navbar
          currentRoute={currentRoute}
          setCurrentRoute={setCurrentRoute}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          onNavigateAuth={handleNavigateAuth}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        
        {/* 1. MASTER HOME PAGE: Portal Gateway (Institute & Placement Options) */}
        {(currentRoute === 'gateway' || currentRoute === 'home') && (
          <PortalGatewayPage
            onSelectPortal={handleSelectPortal}
            onNavigateAuth={handleNavigateAuth}
          />
        )}

        {/* 2. DEDICATED LOGIN / REGISTER PAGE for selected portal */}
        {currentRoute === 'auth-portal' && (
          <AuthPortalPage
            initialPortal={selectedAuthPortal}
            onAuthSuccess={handleAuthSuccess}
            onBackToGateway={() => setCurrentRoute('gateway')}
          />
        )}

        {/* 3. INSTITUTE PORTAL (Teacher, HOD, Students) */}
        {currentRoute === 'institute-portal' && (
          <InstitutePortalPage
            onNavigate={setCurrentRoute}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {/* 4. PLACEMENT PORTAL (HR, Director, TPO, Coordinator) */}
        {currentRoute === 'placement-portal' && (
          <PlacementPortalPage
            onNavigate={setCurrentRoute}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {/* 5. CLASSIC PLACEMENT HOMEPAGE */}
        {currentRoute === 'classic-home' && (
          <HomePage
            onNavigate={setCurrentRoute}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {/* 6. SELECTION WORKFLOW ENGINE */}
        {currentRoute === 'workflow' && (
          <SelectionWorkflowPage
            onNavigate={setCurrentRoute}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {/* 7. DRIVES & PLACEMENT CALENDAR */}
        {currentRoute === 'drives' && (
          <PlacementDrivesPage
            onSelectCompany={handleSelectCompany}
          />
        )}

        {/* 8. COMPANIES LISTING */}
        {currentRoute === 'companies' && (
          <CompaniesPage
            onSelectCompany={handleSelectCompany}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
          />
        )}

        {/* 9. COMPANY PREPARATION HUB */}
        {currentRoute === 'company-hub' && selectedCompany && (
          <CompanyHubPage
            company={selectedCompany}
            onBack={() => setCurrentRoute('companies')}
            onSelectRound={handleSelectRound}
            onSelectQuestion={handleSelectQuestion}
            onStartMockInterview={handleStartMockInterview}
            onViewInsights={handleViewAiInsights}
            onNavigateToDrives={() => setCurrentRoute('drives')}
          />
        )}

        {/* 10. QUESTION PREPARATION & PRACTICE */}
        {currentRoute === 'prep' && (
          <QuestionPrepPage
            initialQuestion={selectedQuestion}
            roundType={selectedRoundType}
            companyId={selectedCompany?.id}
            onBack={() => {
              if (selectedCompany) setCurrentRoute('company-hub');
              else setCurrentRoute('gateway');
            }}
            onNavigateToMock={(company, round) => handleStartMockInterview(company, round)}
          />
        )}

        {/* 11. INTERVIEW EXPERIENCES */}
        {currentRoute === 'experiences' && (
          <ExperiencesPage />
        )}

        {/* 12. AI INSIGHTS */}
        {currentRoute === 'ai-insights' && (
          <AiInsightsPage
            initialCompanyId={selectedCompany?.id || 'hcltech'}
            onSelectQuestion={handleSelectQuestion}
            onLaunchMock={handleStartMockInterview}
          />
        )}

        {/* 13. MOCK INTERVIEW */}
        {currentRoute === 'mock-interview' && (
          <MockInterviewPage
            initialCompany={mockSessionParams.company || selectedCompany}
            initialRound={mockSessionParams.round || 'technical'}
            onFinish={() => setCurrentRoute('dashboard')}
          />
        )}

        {/* 14. STUDENT DASHBOARD */}
        {currentRoute === 'dashboard' && (
          <StudentDashboardPage
            onNavigate={setCurrentRoute}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {/* 15. ACADEMIC RECORDS */}
        {currentRoute === 'academic-records' && (
          <AcademicRecordsPage />
        )}

        {/* 16. SUPER ADMIN (Full CRUD) */}
        {currentRoute === 'admin' && (
          <AdminPage />
        )}

        {/* 17. TEACHER & HOD DAILY CLASS ATTENDANCE PORTAL */}
        {(currentRoute === 'attendance' || currentRoute === 'daily-attendance' || currentRoute === 'class-attendance') && (
          <DailyAttendancePage onNavigate={setCurrentRoute} />
        )}

        {/* 18. CRT TRAINING ATTENDANCE & ELIGIBILITY PORTAL */}
        {(currentRoute === 'crt-attendance' || currentRoute === 'crt-training-attendance') && (
          <CrtAttendancePage onNavigate={setCurrentRoute} />
        )}

        {/* 19. REPORTS EXPORTER (DRIVE ELIGIBILITY, PLACEMENTS & ATTENDANCE) */}
        {(currentRoute === 'reports' || currentRoute === 'reports-exporter') && (
          <ReportsExporterPage onNavigate={setCurrentRoute} />
        )}

        {/* 20. HOD CURRICULUM & SYLLABUS GOVERNANCE */}
        {(currentRoute === 'curriculum-governance' || currentRoute === 'syllabus-governance') && (
          <CurriculumGovernancePage onNavigate={setCurrentRoute} />
        )}

        {/* 21. STUDENT-ONLY DSA & CODING PRACTICE STUDIO */}
        {(currentRoute === 'dsa-studio' || currentRoute === 'dsa-practice') && (
          <DsaPracticePage
            onNavigate={setCurrentRoute}
            onSelectGlobalQuestion={handleSelectQuestion}
          />
        )}

      </main>

      {!isGuidedFlowRoute && <Footer onNavigate={setCurrentRoute} />}

      {!isGuidedFlowRoute && (
        <>
          <BatchSelectionModal
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            onBatchSelected={() => {}}
          />
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onAuthSuccess={() => setCurrentRoute('dashboard')}
            triggerBatchModal={() => setIsBatchModalOpen(true)}
          />
          <GlobalSearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            onSelectResult={handleSearchSelect}
          />
          <PushNotificationDrawer
            isOpen={isNotificationDrawerOpen}
            onClose={() => setIsNotificationDrawerOpen(false)}
            onNavigate={setCurrentRoute}
          />
        </>
      )}

    </div>
  );
}
