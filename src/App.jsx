import React, { lazy, Suspense, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BatchSelectionModal from './components/BatchSelectionModal';
import AuthModal from './components/AuthModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import PushNotificationDrawer from './components/PushNotificationDrawer';
import ErrorBoundary from './components/ErrorBoundary';

// Unified Portal Pages
import PortalGatewayPage from './pages/PortalGatewayPage';
const AuthPortalPage = lazy(() => import('./pages/AuthPortalPage'));
const InstitutePortalPage = lazy(() => import('./pages/InstitutePortalPage'));
const PlacementPortalPage = lazy(() => import('./pages/PlacementPortalPage'));
const ManagementPortalPage = lazy(() => import('./pages/ManagementPortalPage'));
const RemiiLandingPage = lazy(() => import('./pages/RemiiLandingPage'));

// Specialized Placement Prep Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const PlacementDrivesPage = lazy(() => import('./pages/PlacementDrivesPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const CompanyHubPage = lazy(() => import('./pages/CompanyHubPage'));
const QuestionPrepPage = lazy(() => import('./pages/QuestionPrepPage'));
const ExperiencesPage = lazy(() => import('./pages/ExperiencesPage'));
const AiInsightsPage = lazy(() => import('./pages/AiInsightsPage'));
const MockInterviewPage = lazy(() => import('./pages/MockInterviewPage'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SelectionWorkflowPage = lazy(() => import('./pages/SelectionWorkflowPage'));
const AcademicRecordsPage = lazy(() => import('./pages/AcademicRecordsPage'));
const DailyAttendancePage = lazy(() => import('./pages/DailyAttendancePage'));
const CrtAttendancePage = lazy(() => import('./pages/CrtAttendancePage'));
const ReportsExporterPage = lazy(() => import('./pages/ReportsExporterPage'));
const CurriculumGovernancePage = lazy(() => import('./pages/CurriculumGovernancePage'));
const DsaPracticePage = lazy(() => import('./pages/DsaPracticePage'));
const ResumeAtsCheckerPage = lazy(() => import('./pages/ResumeAtsCheckerPage'));
const AcademicProfilePage = lazy(() => import('./pages/AcademicProfilePage'));
const MyApplicationsPage = lazy(() => import('./pages/MyApplicationsPage'));
const StudentOnboardingPage = lazy(() => import('./pages/StudentOnboardingPage'));
const OpportunitiesHubView = lazy(() => import('./components/opportunities/OpportunitiesHubView'));

import { getCompanies, getCurrentUser } from './services/storage';
import { getRoleDefaultDashboard } from './components/ui/BackNavButton';

const VALID_ROUTES = new Set([
  'gateway', 'home', 'classic-home', 'auth-portal', 'student-onboarding', 'institute-portal', 'placement-portal',
  'management-portal', 'landing', 'workflow', 'drives', 'companies', 'company-hub',
  'prep', 'experiences', 'ai-insights', 'mock-interview', 'dashboard', 'academic-records',
  'admin', 'attendance', 'daily-attendance', 'class-attendance', 'crt-attendance',
  'crt-training-attendance', 'reports', 'reports-exporter', 'curriculum-governance',
  'syllabus-governance', 'dsa-studio', 'dsa-practice', 'resume-ats', 'resume-checker', 'ats-checker',
  'opportunities', 'off-campus', 'hackathons', 'internships'
]);

function getInitialRoute() {
  if (typeof window !== 'undefined' && window.location.hash) {
    const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
    if (VALID_ROUTES.has(raw)) return raw;
  }
  return 'gateway';
}

export default function App() {
  // Default to gateway (the Master Home Page with Institute & Placement options)
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [routeHistory, setRouteHistory] = useState([]);
  const [selectedAuthPortal, setSelectedAuthPortal] = useState('institute');
  const [authPortalInitialMode, setAuthPortalInitialMode] = useState('login');
  const [authPortalInitialRole, setAuthPortalInitialRole] = useState(null);
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

  // Viewport scroll reset helper for instant top alignment
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (typeof document !== 'undefined') {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  };

  const handleNavigate = (route) => {
    scrollToTop();
    setRouteHistory(prev => (prev[prev.length - 1] === currentRoute ? prev : [...prev, currentRoute]));
    setCurrentRoute(route);
  };

  const handleBack = (fallbackRoute) => {
    scrollToTop();
    if (routeHistory.length > 0) {
      const prev = routeHistory[routeHistory.length - 1];
      setRouteHistory(h => h.slice(0, -1));
      if (typeof window !== 'undefined' && window.history && window.history.state?.route) {
        window.history.back();
      } else {
        setCurrentRoute(prev);
      }
    } else if (fallbackRoute && VALID_ROUTES.has(fallbackRoute)) {
      setCurrentRoute(fallbackRoute);
    } else {
      const user = getCurrentUser();
      const defaultDashboard = getRoleDefaultDashboard(user);
      setCurrentRoute(defaultDashboard);
    }
  };

  // Automatically snap viewport to top and sync hash on route change
  useEffect(() => {
    scrollToTop();
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.hash !== `#${currentRoute}`) {
        try {
          window.history.pushState({ route: currentRoute }, '', `#${currentRoute}`);
        } catch {}
      }
    }
  }, [currentRoute]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      let targetRoute = null;
      if (e.state && e.state.route && VALID_ROUTES.has(e.state.route)) {
        targetRoute = e.state.route;
      } else if (typeof window !== 'undefined' && window.location.hash) {
        const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
        if (VALID_ROUTES.has(raw)) {
          targetRoute = raw;
        }
      }
      if (targetRoute) {
        setRouteHistory(prev => {
          if (prev.length > 0 && prev[prev.length - 1] === targetRoute) {
            return prev.slice(0, -1);
          }
          return prev;
        });
        setCurrentRoute(targetRoute);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    } else if (portal === 'management') {
      setCurrentRoute('management-portal');
    }
    scrollToTop();
  };

  const handleNavigateAuth = (portalBranch = 'institute', mode = 'login', role = null) => {
    setSelectedAuthPortal(portalBranch);
    setAuthPortalInitialMode(mode);
    setAuthPortalInitialRole(role);
    handleNavigate('auth-portal');
  };

  const handleAuthSuccess = (user, portalBranch, targetRoute) => {
    setAuthorizedPortal(portalBranch);
    if (targetRoute) {
      setCurrentRoute(targetRoute);
    } else if (portalBranch === 'placement' && user?.role === 'student' && (!user?.onboardingCompleted || user?.onboardingStatus !== 'COMPLETED')) {
      setCurrentRoute('student-onboarding');
    } else if (portalBranch === 'institute') {
      setCurrentRoute('institute-portal');
    } else if (portalBranch === 'placement') {
      setCurrentRoute('placement-portal');
    } else if (portalBranch === 'management') {
      setCurrentRoute('management-portal');
    } else {
      setCurrentRoute('dashboard');
    }
    scrollToTop();
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setCurrentRoute('company-hub');
    scrollToTop();
  };

  const handleSelectRound = (roundId, company) => {
    setSelectedRoundType(roundId);
    setSelectedCompany(company);
    setSelectedQuestion(null);
    setCurrentRoute('prep');
    scrollToTop();
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setSelectedRoundType(question.round);
    const companies = getCompanies();
    const foundCompany = companies.find(c => c.id === question.companyId);
    if (foundCompany) setSelectedCompany(foundCompany);
    setCurrentRoute('prep');
    scrollToTop();
  };

  const handleStartMockInterview = (company, round = 'technical') => {
    setMockSessionParams({ company, round });
    setCurrentRoute('mock-interview');
    scrollToTop();
  };

  const handleViewAiInsights = (company) => {
    setSelectedCompany(company);
    setCurrentRoute('ai-insights');
    scrollToTop();
  };

  const handleSearchSelect = (resultItem) => {
    if (resultItem.type === 'company') {
      handleSelectCompany(resultItem.data);
    } else if (resultItem.type === 'question') {
      handleSelectQuestion(resultItem.data);
    } else if (resultItem.type === 'drive') {
      handleNavigate('drives');
    } else if (resultItem.type === 'experience') {
      handleNavigate('experiences');
    } else if (resultItem.type === 'academic-record') {
      handleNavigate('academic-records');
    }
  };

  // If route is 'landing', render standalone Remii-style Landing Page
  if (currentRoute === 'landing') {
    return (
      <Suspense fallback={<div className="pp-route-loading" role="status">Opening PlacePrep…</div>}><RemiiLandingPage onBackToApp={() => handleNavigate('gateway')} /></Suspense>
    );
  }

  const isGuidedFlowRoute = ['gateway', 'home', 'auth-portal', 'student-onboarding', 'institute-portal', 'placement-portal', 'management-portal'].includes(currentRoute);

  return (
    <div className={`pp-app ${['gateway', 'home', 'auth-portal', 'student-onboarding', 'landing'].includes(currentRoute) ? '' : 'pp-workspace'} min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900 font-sans ${currentRoute === 'student-onboarding' ? 'bg-[#F0EFFF] text-slate-800' : isGuidedFlowRoute ? 'bg-slate-950 text-white' : 'bg-[#F8F8F9] text-[#111439]'}`}>
      
      {!isGuidedFlowRoute && (
        <Navbar
          currentRoute={currentRoute}
          setCurrentRoute={handleNavigate}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenBatchModal={() => setIsBatchModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          onNavigateAuth={handleNavigateAuth}
        />
      )}

      {/* Main Content Router */}
      <a className="pp-skip-link" href="#main-content">Skip to content</a>
      <main id="main-content" className="pp-main flex-1" data-route={currentRoute}>
        <ErrorBoundary resetKey={currentRoute}>
        <Suspense fallback={<div className="pp-route-loading" role="status" aria-live="polite"><span className="pp-loading-mark" aria-hidden="true" /><h2>Opening your workspace</h2><p>Getting your tools ready…</p><div className="pp-loading-grid" aria-hidden="true"><span /><span /><span /></div></div>}>
        <div key={currentRoute} className="pp-route">
                
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
            initialMode={authPortalInitialMode}
            initialRole={authPortalInitialRole}
            onAuthSuccess={handleAuthSuccess}
            onBackToGateway={() => handleBack('gateway')}
          />
        )}

        {/* 2b. MULTI-STEP STUDENT PROFILE COMPLETION WIZARD */}
        {currentRoute === 'student-onboarding' && (
          <StudentOnboardingPage
            onComplete={() => {
              setAuthorizedPortal('placement');
              handleNavigate('placement-portal');
            }}
            onNavigateBack={() => handleNavigateAuth('placement', 'register', 'student')}
          />
        )}

        
        {/* 3. INSTITUTE PORTAL (Teacher, HOD, Students) */}
        {currentRoute === 'institute-portal' && (
          <InstitutePortalPage
            onNavigate={handleNavigate}
            onBack={handleBack}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        
        {/* 4. PLACEMENT PORTAL (HR, Director, TPO, Coordinator) */}
        {currentRoute === 'placement-portal' && (
          <PlacementPortalPage
            onNavigate={handleNavigate}
            onBack={handleBack}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        
        {/* 5. CLASSIC PLACEMENT HOMEPAGE */}
        {currentRoute === 'classic-home' && (
          <HomePage
            onNavigate={handleNavigate}
            onBack={handleBack}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        
        {/* 6. SELECTION WORKFLOW ENGINE */}
        {currentRoute === 'workflow' && (
          <SelectionWorkflowPage
            onNavigate={handleNavigate}
            onBack={handleBack}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        
        {/* 7. DRIVES & PLACEMENT CALENDAR */}
        {currentRoute === 'drives' && (
          <PlacementDrivesPage
            onSelectCompany={handleSelectCompany}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        
        {/* 8. COMPANIES LISTING */}
        {currentRoute === 'companies' && (
          <CompaniesPage
            onSelectCompany={handleSelectCompany}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
          />
        )}

        
        {/* 9. COMPANY PREPARATION HUB */}
        {currentRoute === 'company-hub' && selectedCompany && (
          <CompanyHubPage
            company={selectedCompany}
            onBack={() => handleBack('companies')}
            onSelectRound={handleSelectRound}
            onSelectQuestion={handleSelectQuestion}
            onStartMockInterview={handleStartMockInterview}
            onViewInsights={handleViewAiInsights}
            onNavigateToDrives={() => handleNavigate('drives')}
          />
        )}

        
        {/* 10. QUESTION PREPARATION & PRACTICE */}
        {currentRoute === 'prep' && (
          <QuestionPrepPage
            initialQuestion={selectedQuestion}
            roundType={selectedRoundType}
            companyId={selectedCompany?.id}
            onBack={() => handleBack(selectedCompany ? 'company-hub' : 'placement-portal')}
            onNavigateToMock={(company, round) => handleStartMockInterview(company, round)}
          />
        )}

        
        {/* 11. INTERVIEW EXPERIENCES */}
        {currentRoute === 'experiences' && (
          <ExperiencesPage
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        
        {/* 12. AI INSIGHTS */}
        {currentRoute === 'ai-insights' && (
          <AiInsightsPage
            initialCompanyId={selectedCompany?.id || 'hcltech'}
            onSelectQuestion={handleSelectQuestion}
            onLaunchMock={handleStartMockInterview}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        
        {/* 13. MOCK INTERVIEW */}
        {currentRoute === 'mock-interview' && (
          <MockInterviewPage
            initialCompany={mockSessionParams.company || selectedCompany}
            initialRound={mockSessionParams.round || 'technical'}
            onFinish={() => handleBack('placement-portal')}
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        )}

        
        {/* 14. STUDENT DASHBOARD */}
        {currentRoute === 'dashboard' && (
          <StudentDashboardPage
            onNavigate={handleNavigate}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        
        {/* 15. ACADEMIC RECORDS */}
        {currentRoute === 'academic-records' && (
          <AcademicRecordsPage
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        {/* 16. ACADEMIC PROFILE & TRANSCRIPT */}
        {currentRoute === 'academic-profile' && (
          <AcademicProfilePage
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        {/* 17. SELECTION ROUND TRACKER & MY APPLICATIONS */}
        {(currentRoute === 'applications' || currentRoute === 'selection-tracker') && (
          <MyApplicationsPage
            onNavigate={handleNavigate}
            onBack={handleBack}
            onSelectCompany={handleSelectCompany}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        
        {/* 16. SUPER ADMIN (Full CRUD) */}
        {currentRoute === 'admin' && (
          <AdminPage
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        
        {/* 17. TEACHER & HOD DAILY CLASS ATTENDANCE PORTAL */}
        {(currentRoute === 'attendance' || currentRoute === 'daily-attendance' || currentRoute === 'class-attendance') && (
          <DailyAttendancePage onNavigate={handleNavigate} onBack={handleBack} />
        )}

        
        {/* 18. CRT TRAINING ATTENDANCE & ELIGIBILITY PORTAL */}
        {(currentRoute === 'crt-attendance' || currentRoute === 'crt-training-attendance') && (
          <CrtAttendancePage onNavigate={handleNavigate} onBack={handleBack} />
        )}

        
        {/* 19. REPORTS EXPORTER (DRIVE ELIGIBILITY, PLACEMENTS & ATTENDANCE) */}
        {(currentRoute === 'reports' || currentRoute === 'reports-exporter') && (
          <ReportsExporterPage onNavigate={handleNavigate} onBack={handleBack} />
        )}

        
        {/* 20. HOD CURRICULUM & SYLLABUS GOVERNANCE */}
        {(currentRoute === 'curriculum-governance' || currentRoute === 'syllabus-governance') && (
          <CurriculumGovernancePage onNavigate={handleNavigate} onBack={handleBack} />
        )}

        
        {/* 21. STUDENT-ONLY DSA & CODING PRACTICE STUDIO */}
        {(currentRoute === 'dsa-studio' || currentRoute === 'dsa-practice') && (
          <DsaPracticePage
            onNavigate={handleNavigate}
            onBack={handleBack}
            onSelectGlobalQuestion={handleSelectQuestion}
          />
        )}

        
        {/* 23. MANAGEMENT PORTAL (COLLEGE LOCATION & GEOFENCING) */}
        {currentRoute === 'management-portal' && (
          <ManagementPortalPage
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        
        {/* 22. RESUME STATUS & ATS COMPATIBILITY CHECKER */}
        {(currentRoute === 'resume-ats' || currentRoute === 'resume-checker' || currentRoute === 'ats-checker') && (
          <ResumeAtsCheckerPage
            onNavigate={handleNavigate}
            onBack={handleBack}
            onSelectCompany={handleSelectCompany}
          />
        )}

        {/* 24. OPPORTUNITIES & HACKATHONS HUB */}
        {(currentRoute === 'opportunities' || currentRoute === 'off-campus' || currentRoute === 'hackathons' || currentRoute === 'internships') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <OpportunitiesHubView
              initialTab={currentRoute === 'hackathons' ? 'hackathons' : (currentRoute === 'internships' ? 'internships' : (currentRoute === 'off-campus' ? 'jobs' : 'all'))}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        
        </div>
        </Suspense>
              </ErrorBoundary>
      </main>

      {!isGuidedFlowRoute && <Footer onNavigate={handleNavigate} />}

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
            onAuthSuccess={() => handleNavigate('dashboard')}
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
            onNavigate={handleNavigate}
          />
        </>
      )}

    </div>
  );
}
