// PlacePrep AI - Team 2: Institute Support
// Master Page: Student Academic Records Management

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle, 
  Layers, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';

import AcademicDashboardView from '../components/academic/AcademicDashboardView';
import StudentDirectoryView from '../components/academic/StudentDirectoryView';
import SemesterMarksheetsView from '../components/academic/SemesterMarksheetsView';
import BacklogManagementView from '../components/academic/BacklogManagementView';
import ImportExportCenterView from '../components/academic/ImportExportCenterView';
import StudentFormModal from '../components/academic/StudentFormModal';
import StudentProfileModal from '../components/academic/StudentProfileModal';
import BackNavButton from '../components/ui/BackNavButton';

import { 
  getAllStudents, 
  getAllBacklogs, 
  resetAcademicRecordsToDefault 
} from '../services/academicRecordsService';

export default function AcademicRecordsPage({ onNavigate, onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'directory' | 'marksheets' | 'backlogs' | 'import-export'
  const [students, setStudents] = useState([]);
  const [backlogs, setBacklogs] = useState([]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [studentToView, setStudentToView] = useState(null);

  // Marksheet Context (for jumping directly to a student's marksheet)
  const [marksheetContext, setMarksheetContext] = useState({
    studentId: null,
    semester: 1
  });

  // Backlog filter context
  const [backlogStudentFilter, setBacklogStudentFilter] = useState(null);

  // Global toast notification
  const [toast, setToast] = useState(null);

  const refreshData = () => {
    const sList = getAllStudents();
    setStudents(sList);
    const bList = getAllBacklogs();
    setBacklogs(bList);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modal Handlers
  const handleOpenCreateStudent = () => {
    setStudentToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditStudent = (student) => {
    setStudentToEdit(student);
    setIsFormModalOpen(true);
  };

  const handleOpenViewStudent = (student) => {
    setStudentToView(student);
    setIsProfileModalOpen(true);
  };

  const handleOpenMarksheet = (student, semester = 1) => {
    setMarksheetContext({
      studentId: student ? student.id : (students[0]?.id || null),
      semester: semester || 1
    });
    setActiveTab('marksheets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBacklogsForStudent = (student) => {
    setBacklogStudentFilter(student.id);
    setActiveTab('backlogs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStudentSuccess = (savedStudent) => {
    refreshData();
    showToast(`Student record for ${savedStudent.fullName} (${savedStudent.rollNumber}) saved successfully.`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all Student Academic Records and Backlogs to the initial seed data?')) {
      resetAcademicRecordsToDefault();
      refreshData();
      showToast('Database reset to default seed records.');
    }
  };

  const activeBacklogsCount = backlogs.filter(b => b.status === 'Active').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Page Header Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb & Subtitle */}
          <div className="pt-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>PlacePrep AI</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">Institute Support &bull; Team 2</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-indigo-600 font-bold">Academic Records Module</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 transition-colors border border-slate-200"
                title="Restore default student records and demo marksheets"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo Seed Data</span>
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
            
            {/* Tab: Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview Dashboard</span>
            </button>

            {/* Tab: Student Directory */}
            <button
              onClick={() => setActiveTab('directory')}
              className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'directory'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Directory</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {students.length}
              </span>
            </button>

            {/* Tab: Semester Marksheets */}
            <button
              onClick={() => setActiveTab('marksheets')}
              className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'marksheets'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Semester Marksheets (1–8)</span>
            </button>

            {/* Tab: Backlogs */}
            <button
              onClick={() => setActiveTab('backlogs')}
              className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'backlogs'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Backlog Tracker</span>
              {activeBacklogsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  {activeBacklogsCount}
                </span>
              )}
            </button>

            {/* Tab: Bulk Import/Export */}
            <button
              onClick={() => setActiveTab('import-export')}
              className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'import-export'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Import / Export Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {activeTab === 'dashboard' && (
          <AcademicDashboardView
            onNavigateTab={setActiveTab}
            onOpenCreateStudent={handleOpenCreateStudent}
            onOpenViewStudent={handleOpenViewStudent}
          />
        )}

        {activeTab === 'directory' && (
          <StudentDirectoryView
            students={students}
            onRefresh={refreshData}
            onOpenCreateStudent={handleOpenCreateStudent}
            onOpenEditStudent={handleOpenEditStudent}
            onOpenViewStudent={handleOpenViewStudent}
            onOpenMarksheet={handleOpenMarksheet}
            onOpenBacklogs={handleOpenBacklogsForStudent}
          />
        )}

        {activeTab === 'marksheets' && (
          <SemesterMarksheetsView
            initialStudentId={marksheetContext.studentId || (students[0]?.id ?? null)}
            initialSemester={marksheetContext.semester || 1}
            onBackToDirectory={() => setActiveTab('directory')}
          />
        )}

        {activeTab === 'backlogs' && (
          <BacklogManagementView
            initialStudentFilter={backlogStudentFilter}
            onViewMarksheet={(studentId, sem) => {
              handleOpenMarksheet({ id: studentId }, sem);
            }}
          />
        )}

        {activeTab === 'import-export' && (
          <ImportExportCenterView
            onImportCompleted={() => {
              refreshData();
              showToast('Bulk import completed. Student directory updated.');
            }}
          />
        )}
      </main>

      {/* Student Profile Detail Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={studentToView}
        onEditStudent={handleOpenEditStudent}
        onOpenMarksheet={handleOpenMarksheet}
        onOpenBacklogs={handleOpenBacklogsForStudent}
      />

      {/* Student Form Modal (Create & Edit) */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        student={studentToEdit}
        onSaveSuccess={handleSaveStudentSuccess}
      />
    </div>
  );
}
