import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
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

import { 
  isOnboardingCompleted, 
  getGraduationBatch, 
  getCompanies, 
  getInterviewQuestions 
} from './services/storage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedRoundType, setSelectedRoundType] = useState('technical');
  const [mockSessionParams, setMockSessionParams] = useState({ company: null, round: 'technical' });

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Check onboarding on mount
  useEffect(() => {
    const onboardingDone = isOnboardingCompleted();
    if (!onboardingDone) {
      // First visit onboarding prompt
      setIsBatchModalOpen(true);
    }
  }, []);

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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      
      {/* Persistent Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage
            onNavigate={setCurrentRoute}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {currentRoute === 'workflow' && (
          <SelectionWorkflowPage
            onNavigate={setCurrentRoute}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {currentRoute === 'drives' && (
          <PlacementDrivesPage
            onSelectCompany={handleSelectCompany}
          />
        )}

        {currentRoute === 'companies' && (
          <CompaniesPage
            onSelectCompany={handleSelectCompany}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
          />
        )}

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

        {currentRoute === 'prep' && (
          <QuestionPrepPage
            initialQuestion={selectedQuestion}
            roundType={selectedRoundType}
            companyId={selectedCompany?.id}
            onBack={() => {
              if (selectedCompany) setCurrentRoute('company-hub');
              else setCurrentRoute('home');
            }}
            onNavigateToMock={(company, round) => handleStartMockInterview(company, round)}
          />
        )}

        {currentRoute === 'experiences' && (
          <ExperiencesPage />
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
            onFinish={() => setCurrentRoute('dashboard')}
          />
        )}

        {currentRoute === 'dashboard' && (
          <StudentDashboardPage
            onNavigate={setCurrentRoute}
            onSelectCompany={handleSelectCompany}
            onSelectQuestion={handleSelectQuestion}
          />
        )}

        {currentRoute === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={setCurrentRoute} />

      {/* Graduation Batch Selection Modal */}
      <BatchSelectionModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchSelected={(batch) => {
          // Toast or refresh
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentRoute('dashboard');
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
