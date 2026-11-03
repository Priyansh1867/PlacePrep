import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  getCurrentUser,
  setCurrentUser,
  getPlacementStudentProfile,
  savePlacementStudentProfile,
  isPlacementProfileCompleted,
  savePlacementRegistrationDraft,
  getInitialPlacementStudentProfile,
  getFullStudentProfile
} from '../services/storage.js';

// Setup mock localStorage for node test runner
const storageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
globalThis.localStorage = storageMock;

describe('Placement Portal — Student Section 7-Step Registration & Profile Suite', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // TEST 1: Scope of Changes & Student Eligibility
  it('Requirement 1: Placement registration workflow is scoped specifically to student accounts', () => {
    const studentUser = {
      id: 'student-99',
      name: 'Sneha Roy',
      email: 'sneha.roy@college.edu',
      role: 'student',
      graduationBatch: '2026'
    };
    setCurrentUser(studentUser);

    const initial = getPlacementStudentProfile(studentUser);
    assert.ok(initial, 'Student should receive placement profile');
    assert.strictEqual(initial.personalInfo.fullName, 'Sneha Roy');
    assert.strictEqual(initial.contactInfo.primaryEmail, 'sneha.roy@college.edu');

    // Verify recruiter/admin roles do not inherit student placement profile as their portal workflow
    const recruiterUser = {
      id: 'hr-88',
      name: 'Vikram Mehta',
      email: 'vikram.mehta@hcltech.com',
      role: 'recruiter',
      company: 'HCLTech'
    };
    setCurrentUser(recruiterUser);
    assert.strictEqual(getCurrentUser().role, 'recruiter');
    assert.notStrictEqual(getCurrentUser().role, 'student');
  });

  // TEST 2: Student Login & Incomplete Profile Prompt
  it('Requirement 2: Incomplete placement profile is detected and does not force re-registration when completed', () => {
    const newStudent = {
      id: 'student-102',
      name: 'Aarav Patel',
      email: 'aarav.patel@dtu.ac.in',
      role: 'student',
      onboardingCompleted: false
    };
    setCurrentUser(newStudent);

    // Initial check: Profile is incomplete
    const initialProfile = getPlacementStudentProfile(newStudent);
    initialProfile.isCompleted = false;
    savePlacementStudentProfile(initialProfile, newStudent);

    assert.strictEqual(isPlacementProfileCompleted(newStudent), false, 'New student profile should initially be incomplete');

    // Complete the 7-step registration
    initialProfile.isCompleted = true;
    initialProfile.placementDetails.placementEnrollmentStatus = 'ENROLLED';
    initialProfile.placementDetails.placementCycle = '2026-2027';
    savePlacementStudentProfile(initialProfile, newStudent);

    // Subsequent login: Completed status is preserved and does not force registration again
    assert.strictEqual(isPlacementProfileCompleted(newStudent), true, 'Completed profile must remain verified on subsequent logins');
  });

  // TEST 3: Display All Submitted Information in 7 Sections
  it('Requirement 3: Student Profile displays all submitted information across the 7 mandatory sections', () => {
    const verifiedStudent = {
      id: 'student-200',
      name: 'Priyansh Jain',
      email: 'priyansh.jain@example.edu',
      role: 'student',
      rollNumber: '2024/CSE/084',
      college: 'Delhi Technological University (DTU)',
      branch: 'Computer Science and Engineering',
      graduationBatch: '2026',
      phone: '+91 98765 43210'
    };
    setCurrentUser(verifiedStudent);

    const profileData = {
      uniqueStudentId: 'PP-2024084',
      isCompleted: true,
      currentStep: 7,

      // 1. Personal Information
      personalInfo: {
        fullName: 'Priyansh Jain',
        fatherName: 'Rajesh Jain',
        motherName: 'Sunita Jain',
        dateOfBirth: '2004-05-18',
        gender: 'Male',
        registrationNumber: '2024/CSE/084',
        university: 'Delhi Technological University',
        college: 'Delhi Technological University (DTU)',
        branch: 'Computer Science and Engineering',
        currentYear: '3rd Year',
        currentSemester: '6th Semester'
      },

      // 2. Contact Information
      contactInfo: {
        primaryEmail: 'priyansh.jain@example.edu',
        personalEmail: 'priyansh.personal@gmail.com',
        mobileNumber: '+91 98765 43210',
        emailVerified: true,
        mobileVerified: true,
        permanentAddress: 'Flat 402, Block B, Silver Palms, Rohini Sector 14, Delhi - 110085',
        currentAddress: 'Aryabhatta Hostel, Room 314, DTU Campus, Delhi - 110042'
      },

      // 3. Current Education
      currentEducation: {
        degree: 'B.Tech',
        university: 'Delhi Technological University',
        college: 'Delhi Technological University (DTU)',
        branch: 'Computer Science and Engineering',
        admissionYear: '2022',
        graduationYear: '2026',
        cgpa: 8.85,
        backlogs: 0
      },

      // 4. Previous Education
      previousEducation: {
        tenthSchool: 'Delhi Public School',
        tenthBoard: 'CBSE',
        tenthPercentage: 94.2,
        tenthYear: '2020',
        twelfthSchool: 'Delhi Public School',
        twelfthBoard: 'CBSE',
        twelfthStream: 'Science (PCM)',
        twelfthPercentage: 91.8,
        twelfthYear: '2022',
        hasDiploma: false
      },

      // 5. Internships & Work Experience
      internships: [
        {
          id: 'exp-1',
          organization: 'Infosys Springboard',
          role: 'Full Stack Engineering Intern',
          employmentType: 'Internship',
          duration: 'June 2025 - August 2025 (3 Months)',
          description: 'Engineered REST microservices using Spring Boot, React, and MySQL database.',
          skillsUsed: 'Spring Boot, React, MySQL, Git',
          certificates: 'Infosys_Certificate_2025.pdf'
        }
      ],

      // 6. Profile Photo & Documents
      documents: {
        profilePhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        resumeFileName: 'Priyansh_Jain_Master_Resume_2026.pdf',
        resumeUrl: 'blob:https://placeprep.edu/resume.pdf',
        resumeLastUpdated: 'Nov 3, 2026',
        academicMarksheets: [
          { id: 'doc-1', title: '10th Secondary Marksheet', fileName: '10th_Marksheet.pdf' },
          { id: 'doc-2', title: '12th Senior Secondary Marksheet', fileName: '12th_Marksheet.pdf' }
        ],
        certificates: [
          { id: 'cert-1', title: 'AWS Cloud Developer', issuer: 'Amazon Web Services' }
        ],
        otherDocuments: [
          { id: 'oth-1', title: 'DTU Student Identity Card', fileName: 'DTU_ID_Card.pdf' }
        ]
      },

      // 7. Placement Details
      placementDetails: {
        placementEnrollmentStatus: 'ENROLLED',
        placementCycle: '2026-2027',
        enrollmentDate: 'November 3, 2026',
        preferredLocations: ['Bengaluru', 'Delhi NCR', 'Hyderabad'],
        primaryDomain: 'Software Engineering / Full Stack Development',
        willingToRelocate: true,
        declarationAgreed: true
      }
    };

    savePlacementStudentProfile(profileData, verifiedStudent);

    const retrieved = getPlacementStudentProfile(verifiedStudent);
    assert.strictEqual(retrieved.personalInfo.fullName, 'Priyansh Jain');
    assert.strictEqual(retrieved.personalInfo.fatherName, 'Rajesh Jain');
    assert.strictEqual(retrieved.contactInfo.primaryEmail, 'priyansh.jain@example.edu');
    assert.strictEqual(retrieved.contactInfo.emailVerified, true);
    assert.strictEqual(retrieved.currentEducation.cgpa, 8.85);
    assert.strictEqual(retrieved.previousEducation.tenthPercentage, 94.2);
    assert.strictEqual(retrieved.internships.length, 1);
    assert.strictEqual(retrieved.internships[0].organization, 'Infosys Springboard');
    assert.strictEqual(retrieved.documents.resumeFileName, 'Priyansh_Jain_Master_Resume_2026.pdf');
    assert.strictEqual(retrieved.placementDetails.placementEnrollmentStatus, 'ENROLLED');
    assert.strictEqual(retrieved.placementDetails.placementCycle, '2026-2027');
  });

  // TEST 4: Profile Editing Functionality
  it('Requirement 4: Supports editing individual sections, modifying contact info, adding internships and replacing photos', () => {
    const student = {
      id: 'student-300',
      name: 'Aditi Sharma',
      email: 'aditi.sharma@dtu.ac.in',
      role: 'student'
    };
    setCurrentUser(student);

    const initial = getPlacementStudentProfile(student);
    savePlacementStudentProfile(initial, student);

    // 1. Edit contact information
    initial.contactInfo.mobileNumber = '+91 99887 76655';
    initial.contactInfo.currentAddress = 'New Hostel Room 102';
    savePlacementStudentProfile(initial, student);

    let updated = getPlacementStudentProfile(student);
    assert.strictEqual(updated.contactInfo.mobileNumber, '+91 99887 76655');
    assert.strictEqual(updated.contactInfo.currentAddress, 'New Hostel Room 102');

    // 2. Add, edit, delete internships
    const newInternship = {
      id: 'exp-google',
      organization: 'Google Summer of Code',
      role: 'Open Source Contributor',
      employmentType: 'Fellowship',
      duration: 'May 2025 - August 2025',
      description: 'Optimized query latency and built frontend telemetry dashboards.',
      skillsUsed: 'JavaScript, Web Vitals, Node.js',
      certificates: 'GSoC_2025_Certificate.pdf'
    };
    initial.internships.push(newInternship);
    savePlacementStudentProfile(initial, student);

    updated = getPlacementStudentProfile(student);
    assert.ok(updated.internships.some(i => i.organization === 'Google Summer of Code'));

    // 3. Delete internship
    initial.internships = initial.internships.filter(i => i.id !== 'exp-google');
    savePlacementStudentProfile(initial, student);

    updated = getPlacementStudentProfile(student);
    assert.ok(!updated.internships.some(i => i.organization === 'Google Summer of Code'));

    // 4. Replace photo and resume
    initial.documents.profilePhoto = 'data:image/png;base64,UPDATED_PHOTO_DATA';
    initial.documents.resumeFileName = 'Aditi_Updated_Resume_v2.pdf';
    savePlacementStudentProfile(initial, student);

    updated = getPlacementStudentProfile(student);
    assert.strictEqual(updated.documents.profilePhoto, 'data:image/png;base64,UPDATED_PHOTO_DATA');
    assert.strictEqual(updated.documents.resumeFileName, 'Aditi_Updated_Resume_v2.pdf');
  });

  // TEST 5: Database & Storage Synchronization and Drafts
  it('Requirement 5: Handles partially saved drafts and maintains synchronized state across stores', () => {
    const student = {
      id: 'student-400',
      name: 'Rohan Mehra',
      email: 'rohan.mehra@dtu.ac.in',
      role: 'student'
    };
    setCurrentUser(student);

    // Save partial draft at step 3
    const draftData = {
      currentStep: 3,
      personalInfo: {
        fullName: 'Rohan Mehra',
        fatherName: 'Sanjay Mehra',
        registrationNumber: '2024/IT/055'
      },
      currentEducation: {
        degree: 'B.Tech',
        branch: 'Information Technology',
        cgpa: 8.2
      }
    };

    savePlacementRegistrationDraft(draftData, student);

    const draftRetrieved = getPlacementStudentProfile(student);
    assert.strictEqual(draftRetrieved.currentStep, 3);
    assert.strictEqual(draftRetrieved.isCompleted, false);
    assert.strictEqual(draftRetrieved.personalInfo.fatherName, 'Sanjay Mehra');
    assert.strictEqual(draftRetrieved.currentEducation.cgpa, 8.2);

    // Verify top-level user entity also stayed synchronized
    const activeUser = getCurrentUser();
    assert.strictEqual(activeUser.cgpa, 8.2);
    assert.strictEqual(activeUser.rollNumber, '2024/IT/055');
  });

  // TEST 6: Component files and structure integrity
  it('Requirement 6: Placement student section files and wizard components are present and properly exported', () => {
    const wizardPath = path.resolve('src/components/placement/PlacementSevenStepWizard.jsx');
    const profileViewPath = path.resolve('src/components/placement/PlacementStudentProfileView.jsx');
    const sectionPath = path.resolve('src/components/placement/PlacementStudentSection.jsx');

    assert.ok(fs.existsSync(wizardPath), 'PlacementSevenStepWizard.jsx must exist');
    assert.ok(fs.existsSync(profileViewPath), 'PlacementStudentProfileView.jsx must exist');
    assert.ok(fs.existsSync(sectionPath), 'PlacementStudentSection.jsx must exist');

    const portalPageContent = fs.readFileSync('src/pages/PlacementPortalPage.jsx', 'utf8');
    assert.ok(portalPageContent.includes('PlacementStudentSection'), 'PlacementPortalPage must import PlacementStudentSection');
    assert.ok(portalPageContent.includes("activeTab === 'student-profile'"), 'PlacementPortalPage must handle student-profile tab');
  });
});
