# PlacePrep — Smart Campus Placement Preparation Platform

> **Production-Grade SaaS Architecture • Grounded Placement Intelligence • Live Spring Boot REST API & React 19 Frontend**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPriyansh1867%2FPlacePrep)

**PlacePrep** is an institutional placement preparation platform engineered to bridge the gap between academic theory and real-world recruitment drives. Designed for engineering undergraduates, university placement cells, and corporate recruiters, PlacePrep provides company-specific question banks, grounded historical analytics, active recall workspaces, automated academic eligibility verification, schedule conflict prevention, application tracking, and an end-to-end recruitment pipeline.

---

## 🌐 Live Vercel Deployment & Repository Links

- **Live Vercel Application**: [https://place-prep.vercel.app](https://place-prep.vercel.app)
- **Repository Owner**: [@Priyansh1867](https://github.com/Priyansh1867)
- **GitHub Repository**: [https://github.com/Priyansh1867/PlacePrep](https://github.com/Priyansh1867/PlacePrep)
- **Vercel Preview Deployments**: Managed via [Vercel GitHub Integration](https://vercel.com/new/import?s=https://github.com/Priyansh1867/PlacePrep)

---

## 🏛️ Platform Architecture Overview

```mermaid
graph TD
    Client["React 19 Frontend (Vite 8)<br/>Tailwind CSS • Lucide Icons<br/>Port: 5173"]
    Proxy["Vite Dev Proxy<br/>/api -> :8082/api"]
    Gateway["Spring Security 6<br/>AuthTokenFilter (pp_ tokens)<br/>BCrypt Password Hashing"]
    
    Controllers["Spring Boot 3.5 REST Controllers<br/>Auth • User • Company • Drive<br/>Application • Question • Experience<br/>Insights • MockSession • Workflow • Feedback<br/>Eligibility • ScheduleConflict"]
    
    Services["Business Service Layer<br/>ApplicationService • WorkflowService<br/>InsightsService • ExperienceService<br/>CompanyService • DriveService • TokenService<br/>EligibilityService • ScheduleConflictService"]
    
    Database[("MySQL Database<br/>Spring Data JPA • Hibernate DDL<br/>Auto-Seeded via DataInitializer")]

    Client --> Proxy
    Proxy --> Gateway
    Gateway --> Controllers
    Controllers --> Services
    Services --> Database
```

### Technology Stack
* **Frontend**:
  * **Framework**: React 19 with JSX and functional hooks.
  * **Bundler & Tooling**: Vite 8 with ES Module hot reloading and proxy forwarding.
  * **Styling**: Vanilla Tailwind CSS 3 with custom tokens, modern glassmorphism, and responsive breakpoints.
  * **Design System**: 13 atomic UI components in `src/components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Select`, `Dialog`, `Tabs`, `ProgressBar`, `Skeleton`, `EmptyState`, `ErrorState`, `PageHeader`, `Toast`).
  * **Icons**: Lucide React.
  * **Routing**: Hash router (`#dashboard`, `#companies`, `#company-hub`, `#drives`, `#applications`, `#dsa`, `#core-cs`, `#aptitude`, `#prep`, `#experiences`, `#ai-insights`, `#mock-interview`, `#workflow`, `#admin`, `#revision`) with deep linking and history synchronization.
* **Backend**:
  * **Language & Runtime**: Java 25.
  * **Framework**: Spring Boot 3.5.16, Spring Security, Spring Data JPA.
  * **Database**: MySQL, seeded on startup via `DataInitializer.java`.
  * **Security**: Stateless cryptographic token issuance (`pp_<token>`), BCrypt password hashing, and role-based access control (`ROLE_ADMIN` vs `ROLE_STUDENT`).

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Java Development Kit (JDK 21 or 25)**: Verify with `java -version`.
2. **Apache Maven (3.9+)**: Verify with `mvn -version`.
3. **Node.js (18+ or 22+) & npm**: Verify with `node -v` and `npm -v`.
4. **MySQL 8+**: Start a local MySQL server and make sure the configured account can create/use the `placeprep` database.

---

### Step 1: Start the Spring Boot Backend

In your terminal, navigate to the `backend` directory:
```bash
cd backend
mvn spring-boot:run
```
By default, the backend connects to `jdbc:mysql://localhost:3306/placeprep` as `root`. The database is created if it does not exist. Configure a non-default connection before starting the backend with `MYSQL_URL`, `MYSQL_USER`, and `MYSQL_PASSWORD`; for example, in PowerShell:
```powershell
$env:MYSQL_USER = "placeprep"
$env:MYSQL_PASSWORD = "your-local-password"
mvn spring-boot:run
```
* **Backend API Base**: `http://localhost:8082/api`

---

### Step 2: Start the React Frontend

In a separate terminal, navigate to the project root:
```bash
npm install
npm run dev
```
* **Frontend Application**: `http://localhost:5173/`
* API requests to `/api/*` are automatically forwarded to `http://localhost:8082/api` via the Vite proxy configured in `vite.config.js`. Override the proxy target with `VITE_API_PROXY_TARGET` when using another backend port.

---

### Step 3: Run the Test Suites

#### Backend Automated Tests (24 Passing Tests)
```bash
cd backend
mvn test
```
The test suite validates:
* `ApplicationServiceTest` (5 tests): Application tracking, authorization enforcement, stage progression, and KPI metrics.
* `WorkflowServiceTest` (5 tests): Candidate advancement across 4 rounds, elimination with reasons, shortlisting, final selection, and evaluation rubrics.
* `DriveServiceTest` (4 tests): Drive creation, batch filtering, property updates, and retirement.
* `ExperienceServiceTest` (5 tests): Experience retrieval, auto-ID generation, helpful voting, reporting, and moderation.
* `AuthServiceTest` (3 tests): User registration, demo login, and BCrypt encryption.
* `InsightsServiceTest` (2 tests): Statistical calculations grounded in database records without synthetic numbers.

#### Frontend Production Build
```bash
npm run build
```
Validates full TypeScript/JSX bundling, asset optimization, and CSS compilation with 0 errors.

---

## 🔑 Pre-Seeded Demo Accounts

The database is automatically pre-populated on boot via `backend/src/main/java/com/placeprep/config/DataInitializer.java`:

| Role | Email | Password | Access Level | One-Click Demo Button |
| :--- | :--- | :--- | :--- | :--- |
| **Placement Officer (Admin)** | `admin@placeprep.com` | `Admin@123` | `ROLE_ADMIN` | Top Navbar → **Demo Admin** |
| **Engineering Student** | `student@placeprep.com` | `Student@123` | `ROLE_STUDENT` | Top Navbar → **Demo Student** |

> [!NOTE]
> Demo accounts are intended for local development, faculty demonstrations, and end-to-end testing. In production environments, credentials should be configured via environment variables and production database secrets.

---

## 📦 Complete Feature Modules

### 1. Placement Readiness Center (`#dashboard`)
* Transparent 100-point placement readiness rubric:
  * Questions Practiced: up to 40 points
  * Mock Session Average: up to 30 points
  * Company Hub Alignment: up to 15 points
  * Tracked Applications: up to 15 points
* Zero fabricated percentages or fake multipliers. Dynamic quick action shortcuts.

### 2. Placement Drives & Company Management (`#drives` & `#applications`)
* **Recruitment Drives Directory**: Active on-campus schedules, verified CTC packages, reporting times, venue passes, and batch eligibility.
* **Drive Calendar & Logistics**: Venue guidelines, reporting time slots, and pass tickets.
* **Automated Eligibility Engine**: Instant verification of CGPA, 10th/12th percentages, active backlogs, and degree branch.
* **Schedule Conflict Radar**: Automated cross-company assessment overlap detection to prevent candidate double-booking.
* **Candidate Application Lifecycle**: Personal tracking (`INTERESTED` → `APPLIED` → `ASSESSMENT` → `INTERVIEW` → `OFFER` → `REJECTED` → `WITHDRAWN`) with real-time KPI metrics and stage notes update modal.
* **Placement-Team Round Controls**: TPO configurator for round types (Aptitude, Technical, HR), durations, venues, and cutoffs.

### 3. DSA & Coding Practice Studio (`#dsa`)
* Algorithmic coding studio organized by high-frequency interview patterns:
  * Arrays & Hashing • Two Pointers & Sliding Window • Linked Lists
  * Trees & Graphs • Dynamic Programming • Stacks & Queues
* Difficulty filters, solved tracking, and active recall flag shortcuts.
* Real code execution is disabled until a sandbox is configured. Without a runner, the UI reports that execution is unavailable; it never fabricates a passing result.
* The editor supports Java, Python, C++, JavaScript, and SQL (SQLite). SQL interview questions can use the SQLite runner; a `WHERE`/`HAVING` starter script is provided for the HCLTECH question.

### Configure real Judge0 code execution

The backend supports Judge0 CE through its server-side API. The runner is disabled by default. After obtaining a Judge0 RapidAPI key, add these variables to the backend's private environment (for example, `backend/.env` loaded by your process manager, or the deployment platform's secret settings). Do not put the key in a `VITE_*` variable, frontend code, or a committed file:

```dotenv
PLACEPREP_JUDGE0_ENABLED=true
PLACEPREP_JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
PLACEPREP_JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
PLACEPREP_JUDGE0_API_KEY=replace_with_your_private_key
```

Restart the Spring backend after setting the variables. The backend submits each test case to Judge0, polls the returned submission token, and reports the provider's status, standard output, compile/runtime diagnostics, time, and memory. Never run user-submitted programs directly inside the application server; use a properly isolated execution service.

When a question has a concrete expected output, the runner compares the program's output against it. Some interview/concept questions do not define executable sample input/output. For those, the workspace can show that a program compiled and ran, but it explicitly does not claim the answer is correct. Add real examples with exact input and expected output to the question data to enable correctness checks.

To use a self-hosted Judge0 instance instead, set `PLACEPREP_JUDGE0_API_URL` to its base URL. A self-hosted endpoint may not require the RapidAPI key; follow the authentication settings of that deployment.

The corresponding placeholders are in `.env.example`. This template contains no real API credential.

### 4. Core CS Technical Interview Studio (`#core-cs`)
* Dedicated preparation studio covering the 4 foundational pillars:
  * **DBMS**: SQL joins, indexing, ACID properties, normalization, transactions.
  * **OOP**: Polymorphism, dynamic dispatch, abstraction, SOLID principles, design patterns.
  * **Operating Systems**: Processes vs. threads, synchronization, deadlocks, virtual memory, paging.
  * **Computer Networks**: OSI model, TCP 3-way handshake, TCP vs UDP, DNS resolution, TLS/HTTPS.
* High-yield concept cheat sheets and direct links into practice mode.

### 5. Realistic Mock Test Center (`#mock-interview`)
* Three interview round simulations: Technical, HR (Behavioral / STAR), and Managerial.
* Realistic question timer, model answer reveal, voice and text input, and session history logging directly to Spring Boot database.

### 6. Interview Experience Community (`#experiences`)
* Student-submitted interview debriefs with verified questions, difficulty ratings, and preparation advice.
* Interactive "Helpful" upvoting with local session tracking.
* Content moderation flag modal for inappropriate or outdated question reporting.
* Platform feedback submissions connected to `FeedbackApi`.

### 7. AI Interview Coach & Analytics (`#ai-insights`)
* Statistical historical intelligence grounded in genuine database records.
* Platform overview metrics bar (8 recruiter hubs, 40+ vetted questions, verified student logs).
* Dynamic recruiter hub selection with live recalculation and preparation priority matrix.

### 8. Admin Console & Candidate Workflow Pipeline (`#admin` & `#workflow`)
* **Admin Control Panel**:
  * Recruiter profile creation, update, and deletion (`CompanyApi`).
  * Drive broadcasting and schedule management (`DriveApi`).
  * Technical question curation and bank indexing (`QuestionApi`).
  * Experience moderation gate (Approve / Reject) (`ExperienceApi.moderate`).
  * Student feedback and question report reviewing (`FeedbackApi`).
* **Candidate Selection Pipeline**:
  * 4-stage recruitment pipeline (`Aptitude` → `Technical` → `Managerial` → `HR`).
  * Candidate advancement, elimination with notes, shortlisting, and final offer selection.
  * Panel evaluation rubric logging with problem solving, technical depth, and communication ratings.

---

## 📡 REST API Specification

### Authentication & Users
* `POST /api/auth/register` — Register a new student account.
* `POST /api/auth/login` — Authenticate and receive `pp_<token>`.
* `POST /api/auth/demo-login` — 1-click token issuance for demo accounts (`student` or `admin`).
* `GET /api/users/me` — Retrieve current authenticated user profile and saved items.
* `PUT /api/users/me/batch` — Update graduation batch preference.
* `POST /api/users/me/toggle-saved-question/{id}` — Bookmark question.
* `POST /api/users/me/toggle-practiced-question/{id}` — Toggle solved status.
* `POST /api/users/me/toggle-revision-question/{id}` — Flag for active recall.

### Placement Drives & Applications
* `GET /api/drives?batch={batch}` — Catalog of upcoming drives with batch filtering.
* `GET /api/drives/calendar` — Drive schedule calendar events.
* `GET /api/drives/{id}` — Placement drive details.
* `POST /api/drives` *(Admin)* — Announce a new placement drive.
* `PUT /api/drives/{id}` *(Admin)* — Update drive properties.
* `PUT /api/drives/{id}/rounds` *(Admin)* — Configure drive interview rounds.
* `PUT /api/drives/{id}/instructions` *(Admin)* — Update venue and candidate instructions.
* `DELETE /api/drives/{id}` *(Admin)* — Retire a placement drive.
* `GET /api/applications/my` — Get authenticated student's tracked applications.
* `POST /api/applications` — Track drive application with stage status and notes.
* `POST /api/applications/register` — Register student application pass with eligibility and conflict checking.
* `GET /api/applications/student/{studentId}` — Get student application passes.
* `GET /api/applications/drive/{driveId}` — Get applications registered for a drive.
* `PUT /api/applications/{id}/status` — Update recruitment stage.
* `DELETE /api/applications/{id}` — Withdraw application.
* `GET /api/applications/stats` — Summary metrics for student readiness score.

### Eligibility Engine & Conflict Radar
* `POST /api/eligibility/check` — Verify candidate CGPA, 10th/12th, backlogs, and branch eligibility against drive criteria.
* `GET /api/eligibility/check-drive/{driveId}` — Student eligibility evaluation for a specific drive.
* `POST /api/schedules/check-conflict` — Cross-company assessment overlap detection.
* `GET /api/schedules/conflicts/student` — Retrieve flagged conflicts for a student schedule.
* `GET /api/schedules/conflicts/drives` — Platform-wide drive clash report.

### Recruiter Hubs & Questions
* `GET /api/companies?batch={batch}` — List recruiter hubs.
* `GET /api/companies/{id}` — Detailed company overview and recruitment process.
* `POST /api/companies` *(Admin)* — Create company profile.
* `PUT /api/companies/{id}` *(Admin)* — Update company profile.
* `DELETE /api/companies/{id}` *(Admin)* — Remove company profile.
* `GET /api/questions?companyId={id}&round={round}&category={cat}` — Filtered question catalog.
* `POST /api/questions` *(Admin)* — Add question to verified bank.
* `DELETE /api/questions/{id}` *(Admin)* — Remove question from bank.

### Community Debriefs & Analytics
* `GET /api/experiences?companyId={id}&batch={batch}` — Verified interview experiences.
* `POST /api/experiences` — Submit interview debrief.
* `POST /api/experiences/{id}/vote` — Upvote helpful experience.
* `POST /api/experiences/{id}/report` — Flag inappropriate experience.
* `POST /api/experiences/{id}/moderate` *(Admin)* — Approve or reject experience.
* `GET /api/insights/overview` — Platform-wide intelligence metrics.
* `GET /api/insights/{companyId}` — Company-specific analytics and recurrence patterns.
* `POST /api/feedback` — Submit student platform feedback.

### Candidate Workflow Pipeline
* `GET /api/workflow/candidates?companyId={id}&round={round}` — Active recruitment candidates.
* `POST /api/workflow/candidates/{id}/advance?nextRound={round}` — Advance candidate to next round.
* `POST /api/workflow/candidates/{id}/eliminate?reason={reason}` — Eliminate candidate with notes.
* `POST /api/workflow/candidates/{id}/shortlist` — Shortlist candidate.
* `POST /api/workflow/candidates/{id}/select` — Extend final offer.
* `POST /api/workflow/candidates/{id}/evaluate` — Submit panel evaluation scores.

---

## 🔒 Security Architecture

1. **Stateless Token Verification**:
   * Custom `TokenService` issues cryptographic 32-byte tokens (`pp_<token>`).
   * `AuthTokenFilter` intercepts incoming requests, resolves Bearer tokens, and sets Spring `SecurityContext`.
2. **Role-Based Authorization**:
   * Admin mutation endpoints (`POST/PUT/DELETE /api/companies/**`, `/api/drives/**`, `/api/questions/**`, `/api/experiences/*/moderate`) are protected with `hasRole('ADMIN')`.
   * Public interaction endpoints (`POST /api/experiences/*/vote`, `POST /api/feedback`) are accessible without authentication to minimize friction.
   * Student endpoints (`/api/applications/**`, `/api/users/me/**`, `/api/mock-sessions/**`) require authentication.
3. **CORS & CSRF**:
   * Configured for seamless SPA development with credentials and standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`).
4. **Data Protection**:
   * Sensitive password hashes are stripped from `UserDto` and never serialized to clients.

---

## 📄 License & Attribution

Developed for college campus placement preparation and student readiness assessment. Created and maintained by **Priyansh Jain** ([@Priyansh1867](https://github.com/Priyansh1867)). Grounded in authentic hiring transcripts and educational SaaS design standards.
