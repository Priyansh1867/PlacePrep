# PlacePrep — Project Status & Progress Tracker

> **Document Purpose**: Comprehensive progress log and state snapshot for the PlacePrep AI Smart Placement Preparation Platform. Maintained to enable seamless continuation across development sessions without loss of context or duplicate implementations.

---

## A. Project Overview

- **Project Name**: PlacePrep (Smart Placement Preparation & Campus Hiring Platform)
- **Primary Goal**: Transform a prototype placement portal into a polished, production-grade SaaS application featuring genuine database persistence, robust security, a cohesive education-SaaS design system, transparent placement readiness analytics, and complete student interview preparation workflows.
- **Frontend Architecture**:
  - **Framework**: React 19 with JSX and modern functional components.
  - **Tooling**: Vite 8 with ES module bundling and dev proxy (`/api` -> `http://localhost:8080`).
  - **Styling**: Vanilla Tailwind CSS 3 with custom color tokens, modern typography, glassmorphism, and responsive breakpoints.
  - **Iconography**: Lucide React.
  - **Navigation**: Hash-based URL routing (`#dashboard`, `#companies`, `#company-hub`, `#drives`, `#applications`, `#dsa`, `#prep`, `#experiences`, `#ai-insights`, `#mock-interview`, `#workflow`, `#admin`, `#revision`) with browser history (`popstate`/`hashchange`) support, reload persistence, and deep linking.
  - **Design System**: Atomic UI components in `src/components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Select`, `Dialog`, `Tabs`, `Skeleton`, `EmptyState`, `ErrorState`, `ProgressBar`, `PageHeader`, `Toast`).
- **Backend Architecture**:
  - **Runtime & Framework**: Java 25, Spring Boot 3.5.16, Spring Data JPA.
  - **Security**: Spring Security with custom stateless `AuthTokenFilter`, `TokenService` (cryptographic token issuance), BCrypt password hashing (`BCryptPasswordEncoder`), Jakarta Validation (`@NotBlank`, `@Email`, `@Size`), and role-based authorization (`ROLE_ADMIN` vs `ROLE_STUDENT`).
  - **Database**: H2 In-Memory/File Database with Hibernate DDL auto-update (`create-drop` or `update`), fully seeded on application boot via `DataInitializer.java`.
  - **REST API Conventions**: Standard JSON payloads, HTTP status codes (200, 201, 204, 400, 401, 403, 404, 409), Authorization header (`Bearer pp_<token>`).

---

## B. Feature Implementation Status

### Module 1: Placement Readiness Center
- **Status**: `COMPLETE`
- **Completed**:
  - Transparent, 100-point documented placement readiness scoring rubric:
    - Questions Practiced: up to 40 points.
    - Mock Session Average Score: up to 30 points.
    - Company Hub Alignment: up to 15 points.
    - Tracked Placement Applications: up to 15 points.
  - Zero fabricated percentages, fake quotes, or synthetic multipliers. If no data exists, provides clear onboarding instructions.
  - KPI metric cards (Practiced Questions, Saved Edge-Cases, Target Companies, Active Applications).
  - Quick action buttons (Start AI Mock, Practice DSA, View Company Hubs, Campus Drives).
  - Responsive layout with collapsible sidebar integration.
- **Entities & Endpoints**: `com.placeprep.model.User`, `com.placeprep.controller.UserController` (`GET /api/users/me`).
- **Files**: `src/pages/StudentDashboardPage.jsx`, `src/services/api.js`, `src/services/storage.js`.
- **Verification**: Verified with `npm run build` and integration with `UserApi.getMe()`.

### Module 2: Placement Drive Tracker
- **Status**: `COMPLETE`
- **Completed**:
  - Campus hiring drive catalog with verified eligibility criteria, CTC packages, drive dates, and batch filtering (`2026`, `2027`, `2028`, `2029`, `all`).
  - Direct "Apply & Track" and "Bookmark / Interested" buttons on every drive card, persisting directly to the backend database.
  - Dedicated student tracking page (`src/pages/MyApplicationsPage.jsx`) displaying application stages (`INTERESTED`, `APPLIED`, `ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`).
  - Interactive "Update Stage" modal with notes and deadline reminders.
  - Withdrawal and removal capabilities with user confirmation.
  - Real-time application KPI summary (Total Tracked, In Progress, Interviews, Offers).
- **Entities & Endpoints**:
  - `com.placeprep.model.PlacementDrive`, `com.placeprep.model.PlacementApplication`.
  - `com.placeprep.controller.DriveController` (`GET /api/drives`, `POST /api/drives`).
  - `com.placeprep.controller.ApplicationController` (`GET /api/applications/my`, `POST /api/applications`, `PUT /api/applications/{id}/status`, `DELETE /api/applications/{id}`).
- **Files**: `src/pages/PlacementDrivesPage.jsx`, `src/pages/MyApplicationsPage.jsx`, `src/services/api.js`.
- **Verification**: Verified via `npm run build` and Maven compilation.

### Module 3: DSA & Coding Practice Studio
- **Status**: `COMPLETE`
- **Completed**:
  - Algorithmic problem studio (`src/pages/DsaPracticePage.jsx`) categorized by fundamental patterns:
    - Arrays & Hashing
    - Two Pointers & Sliding Window
    - Linked Lists
    - Trees & Graphs
    - Dynamic Programming
    - Stack & Queue
    - Recursion & Backtracking
  - Filterable by difficulty (`ALL`, `EASY`, `MEDIUM`, `HARD`) and keyword search.
  - Solved/practiced toggles with persistence to both local storage and `UserApi` backend profile.
  - "Flag for Revision" shortcut directly adding questions to the student's active recall queue.
  - Overall progress bar and difficulty-wise solved percentages.
- **Entities & Endpoints**: `com.placeprep.model.InterviewQuestion`, `com.placeprep.controller.QuestionController` (`GET /api/questions`).
- **Files**: `src/pages/DsaPracticePage.jsx`, `src/pages/QuestionPrepPage.jsx`.
- **Verification**: Verified via `npm run build`.

### Module 4: Realistic Mock Test Center
- **Status**: `PARTIAL`
- **Completed**:
  - Three interview round formats supported: Technical, HR (Behavioral/STAR), and Managerial.
  - Company-specific question sampling with timer, answer input, and real-time guidance.
  - Session history saving and retrieval via `MockSessionApi.saveSession` and `MockSessionApi.getMySessions`.
  - Backend `MockSession` entity, repository, and controller with user association.
- **Partially Completed / Missing**:
  - Timed online assessment test simulator with automated test case evaluation.
  - Audio/speech input interface (currently text-based response entry).
- **Entities & Endpoints**: `com.placeprep.model.MockSession`, `com.placeprep.controller.MockSessionController`.
- **Files**: `src/pages/MockInterviewPage.jsx`, `src/services/api.js`.
- **Verification**: Backend endpoints verified via compilation.

### Module 5: Interview Experience Community
- **Status**: `COMPLETE`
- **Completed**:
  - Direct live wiring of `src/pages/ExperiencesPage.jsx` to `ExperienceApi` (`getAll`, `create`, `vote`, `report`) and `FeedbackApi` (`submit`).
  - Student experience submission modal submitting directly to backend `POST /api/experiences` with fallback storage sync.
  - Interactive "Helpful" upvoting (`POST /api/experiences/{id}/vote`) with optimistic count update and persistent session tracking (`placeprep_voted_experiences`).
  - Student reporting modal (`POST /api/experiences/{id}/report`) for content moderation and quality control.
  - Platform feedback modal submitting to `POST /api/feedback` with category breakdown and star ratings.
  - Backend `ExperienceServiceTest.java` suite covering retrieval, creation, voting, reporting, and moderation (5/5 passing).
- **Entities & Endpoints**: `com.placeprep.model.InterviewExperience`, `com.placeprep.controller.ExperienceController`, `com.placeprep.controller.FeedbackController`.
- **Files**: `src/pages/ExperiencesPage.jsx`, `src/services/api.js`, `backend/src/test/java/com/placeprep/ExperienceServiceTest.java`.
- **Verification**: Verified via `mvn test` (5/5 passing in ExperienceServiceTest) and `npm run build`.

### Module 6: AI Interview Coach & Readiness Analytics
- **Status**: `COMPLETE`
- **Completed**:
  - Connected `src/pages/AiInsightsPage.jsx` directly to `InsightsApi.getByCompany()` and `InsightsApi.getOverview()`.
  - Added global intelligence metrics bar tracking total companies (8), vetted questions (40+), student logs, and zero synthetic metrics indicator.
  - Dynamic company switching with recomputation from database records and animated loading feedback.
  - Transparent analytics grounded strictly in verified sample counts, question frequency, and historical records (no fabricated stats).
  - Enriched backend `InsightsService.java` with confidence score calibration, historical vs. recent drive analysis, and methodology disclaimers.
  - Automated unit test suite `InsightsServiceTest.java` (2 tests, 100% passing).
- **Entities & Endpoints**: `com.placeprep.controller.InsightsController`, `com.placeprep.service.InsightsService`.
- **Files**: `src/pages/AiInsightsPage.jsx`, `backend/src/main/java/com/placeprep/service/InsightsService.java`, `backend/src/test/java/com/placeprep/InsightsServiceTest.java`.
- **Verification**: Unit tests passed (2/2) and live frontend compilation verified.

### Module 7: Structured Learning & Revision
- **Status**: `COMPLETE`
- **Completed**:
  - Dedicated active recall workspace (`src/pages/RevisionPage.jsx`).
  - Flag questions from Company Hubs, DSA Studio, or Question Bank into personal revision list.
  - Practiced state check-off and round filtering (Technical, HR, Managerial).
  - Deep linking from revision card directly into active prep mode (`QuestionPrepPage`).
  - Synchronized with `UserApi.getMe().revisionQuestionIds` and localStorage.
- **Entities & Endpoints**: `com.placeprep.model.InterviewQuestion`, `com.placeprep.controller.UserController`.
- **Files**: `src/pages/RevisionPage.jsx`, `src/pages/CompanyHubPage.jsx`, `src/pages/QuestionPrepPage.jsx`.
- **Verification**: Verified via `npm run build`.

### Module 8: Admin & Content Quality Center
- **Status**: `COMPLETE`
- **Completed**:
  - Direct live wiring of `src/pages/AdminPage.jsx` to `CompanyApi` (`getAll`, `create`, `delete`), `DriveApi` (`getAll`, `create`, `delete`), `QuestionApi` (`getAll`, `create`, `delete`), `ExperienceApi.moderate`, and `FeedbackApi.getAll()`.
  - Enforced server-side role authorization: administrative mutations strictly require Spring Security `ROLE_ADMIN` (verified via Bearer token).
  - Built-in non-admin warning banner with 1-click authorization switch to Demo Admin (`admin@placeprep.com`).
  - Direct live wiring of `src/pages/SelectionWorkflowPage.jsx` to `WorkflowApi` (`getCandidates`, `advanceCandidate`, `eliminateCandidate`, `shortlistCandidate`, `selectCandidate`, `submitEvaluation`).
  - Added real-time feedback toast notifications on candidate progression and manual refresh button syncing candidate records with H2 database.
  - Dedicated candidate evaluation modal recording rubrics for problem solving, technical depth, and communication directly into Spring Data JPA.
- **Entities & Endpoints**: `com.placeprep.controller.WorkflowController`, `com.placeprep.controller.CompanyController`, `com.placeprep.controller.DriveController`, `com.placeprep.controller.QuestionController`, `com.placeprep.controller.FeedbackController`.
- **Files**: `src/pages/AdminPage.jsx`, `src/pages/SelectionWorkflowPage.jsx`, `backend/src/main/java/com/placeprep/config/SecurityConfig.java`.
- **Verification**: Verified via `mvn test` (24/24 passing tests) and `npm run build`.

---

## C. Recent Changes

### 1. Backend Security & Database Seeding
- **`backend/src/main/java/com/placeprep/config/TokenService.java`**: Implemented cryptographically secure stateless tokens prefixed with `pp_` for authenticated session management.
- **`backend/src/main/java/com/placeprep/config/AuthTokenFilter.java`**: Stateless servlet filter that extracts Bearer token, validates it against `TokenService`, and populates Spring `SecurityContext`.
- **`backend/src/main/java/com/placeprep/config/SecurityConfig.java`**: Configured CORS, CSRF disable, stateless session management, BCrypt password encoder, and URL authorization rules (`/api/auth/**`, `/api/companies/**` public; `/api/admin/**` restricted to `ROLE_ADMIN`).
- **`backend/src/main/java/com/placeprep/config/DataInitializer.java`**: Automatic database seeder that populates 2 default accounts (`admin@placeprep.com`, `student@placeprep.com`), 8 recruiters (HCLTech, TCS, Infosys, Deloitte, Accenture, Wipro, Cognizant, Amazon), 5 upcoming drives, 40+ questions across 6 categories, peer experiences, and candidate pipeline records.
- **`backend/src/main/java/com/placeprep/dto/`**: Created `AuthRequest`, `AuthResponse`, `RegisterRequest`, and `UserDto` (guaranteeing password hashes are never serialized to clients).
- **`backend/src/main/java/com/placeprep/model/PlacementApplication.java`**: Entity tracking student drive applications and recruitment lifecycle stages.
- **`backend/src/main/java/com/placeprep/model/Candidate.java`**: Entity representing applicants in the campus placement pipeline.
- **`backend/src/main/java/com/placeprep/controller/ApplicationController.java`**: REST controller for tracking student placement applications.
- **`backend/src/main/java/com/placeprep/controller/WorkflowController.java`**: REST controller for managing candidate pipeline stages.
- **`backend/src/test/java/com/placeprep/AuthServiceTest.java`**: 3 automated tests verifying registration, login, and password encryption.
- **`backend/src/test/java/com/placeprep/InsightsServiceTest.java`**: 2 automated tests verifying statistical calculation without fake data.

### 2. Frontend Design System & Navigation Shell
- **`src/components/ui/`**: Created 13 reusable UI components:
  - `Button.jsx`: Variants (primary, secondary, outline, ghost, danger), loading states, icon support.
  - `Card.jsx`, `CardHeader.jsx`, `CardTitle.jsx`, `CardDescription.jsx`, `CardContent.jsx`, `CardFooter.jsx`.
  - `Badge.jsx`: Color variants (indigo, emerald, amber, rose, violet, slate), dot indicators.
  - `Input.jsx` & `Select.jsx`: Styled form inputs with label, error text, helper text, and icons.
  - `Dialog.jsx`: Accessible modal dialog with backdrop blur and customizable action footer.
  - `Tabs.jsx`: Horizontal pill and underline tab switches.
  - `ProgressBar.jsx`: Accessible meter with color and size tokens.
  - `Skeleton.jsx`: Loading skeleton placeholders.
  - `EmptyState.jsx` & `ErrorState.jsx`: Zero-data and network-failure communication cards.
  - `PageHeader.jsx`: Unified top banner with badge, title, subtitle, and action buttons.
  - `Toast.jsx`: Ephemeral notification toast container.
- **`src/components/Sidebar.jsx`**: Collapsible desktop navigation bar (256px expanded / 80px collapsed) with grouped navigation (Overview, Prepare, Placement, Progress, Administration) and user role indicator.
- **`src/components/Navbar.jsx`**: Top application bar with mobile drawer toggle, `Ctrl+K` search button, graduation batch indicator, and one-click demo login buttons (Student / Admin).
- **`src/components/AuthModal.jsx`**: Rebuilt authentication modal authenticating directly against Spring Boot backend with BCrypt and error feedback.
- **`src/App.jsx`**: Wired hash-based router (`#dashboard`, `#companies`, `#drives`, `#applications`, `#dsa`, `#core-cs`, `#aptitude`, `#prep`, `#experiences`, `#ai-insights`, `#mock-interview`, `#workflow`, `#admin`, `#revision`) with back/forward history synchronization, sidebar layout, and deep linking.

### 3. Dedicated Preparation & Tracking Pages
- **`src/pages/MyApplicationsPage.jsx`**: Created dedicated campus placement tracker connecting to `ApplicationApi`, with stage updates, KPI cards, and notes.
- **`src/pages/PlacementDrivesPage.jsx`**: Rebuilt with live `DriveApi.getAll()` and personal "Apply & Track" button connected to `ApplicationApi`.
- **`src/pages/DsaPracticePage.jsx`**: Created algorithmic coding problem studio with topic pills, difficulty filters, and progress bars.
- **`src/pages/RevisionPage.jsx`**: Created active recall workspace for marked edge-case problems.
- **`src/pages/StudentDashboardPage.jsx`**: Rebuilt with documented 100-point readiness rubric and zero fabricated statistics.
- **`src/pages/CompaniesPage.jsx` & `src/pages/CompanyHubPage.jsx`**: Upgraded to fetch live company and question data via `CompanyApi` and `QuestionApi`.
- **`src/pages/ExperiencesPage.jsx`**: Fully connected to Spring Boot `ExperienceApi` and `FeedbackApi` with live debrief loading, student submission modal, helpful voting with local session tracking, and content reporting modal.
- **`src/pages/AiInsightsPage.jsx`**: Rebuilt with live `InsightsApi.getByCompany()` and `InsightsApi.getOverview()`, real-time recalculation on recruiter hub selection, and aggregate platform intelligence KPIs.
- **`src/services/api.js`**: Complete REST client with Bearer token authentication, error handling, and modules for Auth, User, Company, Drive, Application, Question, Experience, Insights, MockSession, Workflow, Feedback.
- **`backend/src/main/java/com/placeprep/service/InsightsService.java`**: Enriched with transparent confidence scores, verified archives badge, and historical vs. recent drive analysis.
- **`backend/src/main/java/com/placeprep/config/SecurityConfig.java`**: Configured public access for helpful voting (`POST /api/experiences/*/vote`) and platform feedback (`POST /api/feedback`), strict role requirement `hasRole("ADMIN")` for company, drive, question, and moderation mutations, and authenticated access for user applications and workflow operations.
- **`backend/src/test/java/com/placeprep/ExperienceServiceTest.java`**: Added 5 automated unit tests verifying retrieval, creation, ID auto-generation, voting increment, reporting, and moderation.

### 4. Admin Console & Selection Workflow Integration
- **`src/pages/AdminPage.jsx`**: Replaced all localStorage-only mutations with live REST calls to `CompanyApi`, `DriveApi`, `QuestionApi`, `ExperienceApi.moderate`, and `FeedbackApi.getAll()`. Added real-time non-admin warning banner with a 1-click Demo Admin switch (`admin@placeprep.com`).
- **`src/pages/SelectionWorkflowPage.jsx`**: Connected candidate pipeline directly to `WorkflowApi` (`getCandidates`, `advanceCandidate`, `eliminateCandidate`, `shortlistCandidate`, `selectCandidate`, `submitEvaluation`). Added interactive rubric modal, toast notifications, and manual reload button.
- **`src/services/api.js`**: Enriched `WorkflowApi` with `submitStakeholderFeedback` proxying to `POST /api/feedback`.

### 5. Dedicated Core CS Studio
- **`src/pages/CoreCsPage.jsx`**: Implemented a comprehensive Core Computer Science workspace covering DBMS, Object-Oriented Programming (OOP), Operating Systems (OS), and Computer Networks (CN). Includes high-yield placement cheatsheets, recurrence badges, topic search, live question bank browsing, and active recall revision list toggles.
- **`src/App.jsx`**: Wired `#core-cs` hash route directly to `CoreCsPage.jsx` with deep linking and question prep navigation.

### 6. Automated Spring Boot Test Suite (30 Tests, 100% Passing)
- **`backend/src/test/java/com/placeprep/ControllerIntegrationTest.java`**: Added 6 Spring Boot MockMvc integration tests verifying public endpoint accessibility (`/api/companies`, `/api/drives`, `/api/workflow/candidates`), anonymous request denial (403), student role restrictions, admin drive creation (201 Created), candidate advancement across rounds, and evaluation rubric persistence.
- **`backend/src/test/java/com/placeprep/ApplicationServiceTest.java`**: Added 5 unit tests for application tracking, duplicate detection, and stage progression.
- **`backend/src/test/java/com/placeprep/WorkflowServiceTest.java`**: Added 5 unit tests for pipeline state transitions, elimination, shortlisting, and evaluation scoring.
- **`backend/src/test/java/com/placeprep/DriveServiceTest.java`**: Added 4 unit tests for campus drive creation, batch filtering, and retirement.

### 7. Documentation & Architecture
- **`README.md`**: Completely rewritten with Mermaid system architecture diagrams, full technology stack, step-by-step startup guide, default demo credentials (`admin@placeprep.com`, `student@placeprep.com`), 8 feature module overviews, and full REST API endpoint specifications.

---

## D. Build and Testing Evidence

### 1. Backend Build & Tests
- **Command Executed**: `mvn test` in directory `e:\PlacePrep\backend`.
- **Execution Date**: 2026-10-21 10:54:33 IST.
- **Result**: `BUILD SUCCESS`.
- **Test Details**:
  ```
  [INFO] Running com.placeprep.ApplicationServiceTest
  [INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0 -- in com.placeprep.ApplicationServiceTest
  [INFO] Running com.placeprep.AuthServiceTest
  [INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0 -- in com.placeprep.AuthServiceTest
  [INFO] Running com.placeprep.ControllerIntegrationTest
  [INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0 -- in com.placeprep.ControllerIntegrationTest
  [INFO] Running com.placeprep.DriveServiceTest
  [INFO] Tests run: 4, Failures: 0, Errors: 0, Skipped: 0 -- in com.placeprep.DriveServiceTest
  [INFO] Running com.placeprep.ExperienceServiceTest
  [INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0 -- in com.placeprep.ExperienceServiceTest
  [INFO] Running com.placeprep.InsightsServiceTest
  [INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 -- in com.placeprep.InsightsServiceTest
  [INFO] Running com.placeprep.WorkflowServiceTest
  [INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0 -- in com.placeprep.WorkflowServiceTest
  [INFO] 
  [INFO] Results:
  [INFO] Tests run: 30, Failures: 0, Errors: 0, Skipped: 0
  [INFO] BUILD SUCCESS
  [INFO] Total time: 10.089 s
  ```

### 2. Frontend Build
- **Command Executed**: `npm run build` in directory `e:\PlacePrep`.
- **Execution Date**: 2026-10-21 10:55:54 IST.
- **Result**: `✓ built in 17.20s` with 0 errors.
- **Bundle Output Details**:
  - `dist/index.html`: 0.99 kB (gzip: 0.58 kB)
  - `dist/assets/index-6X7iz-Ug.css`: 53.51 kB (gzip: 9.32 kB)
  - `dist/assets/index-DVyeGeQr.js`: 640.26 kB (gzip: 171.10 kB)

### 3. Tests Not Yet Executed
- Headless browser automated end-to-end user journey tests (Cypress/Playwright) with simultaneous backend execution.

---

## E. Outstanding Issues & Gaps

1. **Timed Assessment Engine (Future Enhancement)**:
   - Automated online coding assessment simulator with sandboxed code compilation/execution for C++, Java, and Python.
2. **Audio/Speech Interface (Future Enhancement)**:
   - Voice-based speech recognition for natural verbal AI mock interview practice.

---

## F. Exact Next Steps (Prioritized Checklist)

1. **Task 1 (COMPLETED)**: Wire `src/pages/ExperiencesPage.jsx` and `src/pages/AiInsightsPage.jsx` to live REST APIs (`ExperienceApi` and `InsightsApi`).
2. **Task 2 (COMPLETED)**: Connect `src/pages/AdminPage.jsx` and `src/pages/SelectionWorkflowPage.jsx` to `CompanyApi`, `DriveApi`, `QuestionApi`, and `WorkflowApi`.
3. **Task 3 (COMPLETED)**: Create `src/pages/CoreCsPage.jsx` for modular topic exploration (DBMS, OOP, OS, Networks) with visual diagrams and key concept revision.
4. **Task 4 (COMPLETED)**: Add Spring Boot MockMvc integration tests for controllers (`ControllerIntegrationTest.java`) and service suites (`ApplicationServiceTest`, `WorkflowServiceTest`, `DriveServiceTest`).
5. **Task 5 (COMPLETED)**: Update root `README.md` with complete developer setup, architecture diagrams, API specification, and demonstration instructions.

---

## G. Continuation Instructions for Future Sessions

When resuming work in a new Antigravity session, follow these steps:

1. **Read `PROGRESS.md` first**: This document contains the current state of both frontend and backend.
2. **Inspect Current Git Status**:
   ```bash
   git status
   ```
   Verify that no files have been unexpectedly modified or deleted.
3. **Verify Build Status**:
   - In `e:\PlacePrep`: Run `npm run build` to verify frontend compilation.
   - In `e:\PlacePrep\backend`: Run `mvn test` to verify all 30 automated backend tests pass.
4. **Preserve Working Functionality**:
   - Never remove existing REST endpoints or storage compatibility fallbacks.
   - Maintain the established design system tokens in `src/components/ui/`.
   - Keep Java Spring Boot port on `8080` and Vite dev server configured with `/api` proxy.
   - Do not commit or push to GitHub without explicit user permission.
