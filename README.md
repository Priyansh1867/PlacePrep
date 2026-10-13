# PlacePrep AI – Smart Placement Preparation Platform

> **Grounded in Historical Campus Placement Data • Powered by Intelligent Analytics**

**PlacePrep AI** is a placement preparation platform designed for college engineering students. It bridges the gap between generic coding portals and actual campus hiring drives by providing company-specific interview intelligence, authentic peer debriefs, batch personalization, and simulated AI mock interviews.

---

## 🚀 Live Access & Getting Started

The platform is running live on your system:
* **Local Web Interface**: [http://localhost:5173/](http://localhost:5173/)
* **Project Directory**: `C:\Users\PRIYANSH JAIN\OneDrive\Desktop\Interview Drive`

### Commands
```bash
# Run Development Server
npm run dev

# Build Production Bundle
npm run build

# Preview Production Build
npm run preview
```

---

## 🌟 Key Features & Implementation Breakdown

### 1. Homepage & Central Placement Dashboard
* **Dynamic Header Navigation**: Brand logo, Navigation links (Home, Placement Drives, Companies, Interview Prep, Experiences, AI Insights, AI Mock, Admin), Batch selector badge, Profile menu, and Search shortcut (`⌘K` / `Ctrl+K`).
* **Hero Section**:
  * Title: *"Your Placement Journey Starts Here."*
  * Subtitle: *"Prepare smarter, explore company-specific interview experiences, and get AI-powered insights to crack your dream placement."*
  * Quick CTAs: **Explore Placement Drives** and **Start Preparing by Company**.
  * Personalized batch greeting indicator.
* **7 Core Sections**:
  1. Upcoming Placement Drives (Confirmed dates, deadlines, CTC, eligibility)
  2. Popular Companies (Personalized for the active batch)
  3. Recently Added Interview Experiences (Actual peer debriefs)
  4. Most Frequently Asked Interview Questions (Sorted by statistical occurrence)
  5. AI-Powered Interview Insights Preview (Grounded historical shifts)
  6. Student Success Stories (Seniors placed at HCLTech, TCS Digital, Deloitte)
  7. Placement Preparation Resources (Core CS 100, STAR guide, SQL master sheet)

---

### 2. Student Registration & Authentication
* **Full Onboarding Form**: Name, College, Branch, Graduation Batch, Email, Password with visibility toggle.
* **1-Click Demo Logins**:
  * *Demo Student (2028 Batch)*
  * *Demo Admin (Placement Officer)*
* Form validation, error/success messaging, and forgot password flow.

---

### 3. Graduation Batch Selection & Personalization
* **Modal Trigger**: Appears during onboarding or on-demand from the navbar.
* **Batch Choices**: `2026 Batch`, `2027 Batch`, `2028 Batch`, `2029 Batch`, and `Other`.
* **Dynamic Interaction**:
  * *"You are a 2028 batch student."*
  * Click **Continue** to save and personalize company eligibility and drive calendars.

---

### 4. Batch-Specific Company Directory
* Pre-configured with major campus recruiters:
  * **HCLTech** (Graduate Engineer Trainee, Specialist Programmer)
  * **TCS** (Ninja, Digital, Prime)
  * **Infosys** (Systems Engineer, DSE, Specialist Programmer)
  * **Accenture** (Associate Software Engineer, Advanced ASE)
  * **Deloitte** (Technology Consulting, Cyber Risk)
  * **Wipro**, **Capgemini**, **Cognizant**, etc.
* Real-time search, batch eligibility filtering, status indicators, and prep progress tracking.

---

### 5. Company-Specific Preparation Hubs (e.g., HCLTech)
* **Section A – Company Overview**: Recruitment process stages, CTC package, verified eligibility requirements, and historical data freshness.
* **Section B – Interview Round Categories**:
  * **Technical Round**: DSA, OOPs, DBMS/SQL, OS, Computer Networks, System Design.
  * **HR Round**: Self Introduction (STAR), Why this company, Career goals, Relocation.
  * **Managerial Round**: Conflict resolution, Handling pressure, Leadership scenarios.
* **Section C – Individual Question Prep Page**:
  * Question, Difficulty, Frequency %, STAR/Algorithmic framework approach.
  * Model answer with code blocks, follow-up questions, and active recall answer toggle.
  * Controls: *Mark as Practiced*, *Save Question*, *Add to Revision List*, *Previous/Next*.

---

### 6. AI-Powered Interview Intelligence Engine
* **Statistical Grounding**: Grounded in historical transcripts rather than generic hallucinations.
* **Frequency Distribution**: Verified historical frequencies (e.g., *Floyd's Cycle reported 24 times; 89% occurrence*).
* **Trending Topics**: Tracks 2025-2026 shifts (e.g., Cloud & REST APIs +42% in HCLTech).
* **Historical vs Recent Comparison**: Clear analysis of older drives vs modern expectations.
* **Preparation Priority Matrix**: High Priority (Must-Do), Medium Priority, and Additional Practice.
* **Simulated AI Mock Interviewer**:
  * 1-on-1 progressive interview session.
  * Text and speech dictation input.
  * Automated diagnostic feedback scoring: **Overall Score**, **Correctness & Depth**, **Clarity & Tone**, **STAR Structure**, and **Actionable Improvements**.

---

### 7. Peer Experience & Feedback Vault
* **Contribute Experience Form**: Company, Batch, Role, Round, Questions asked, Difficulty, Outcome, and Preparation tips.
* **Privacy Controls**: Anonymous toggle to protect candidate identity.
* **Feedback System**: Report questions, provide suggestions, and rate platform materials.

---

### 8. Student Dashboard & Analytics
* **My Placement Journey**: Selected batch, target companies, saved questions, and progress meter.
* **Visual Analytics**:
  * Progress across Technical vs HR vs Managerial rounds.
  * Strong Topics vs Focus Needed diagnosis.
  * Mock interview performance history.
* **Resume Preparation**: 1-click continuation of active study sessions.

---

### 9. Admin Dashboard
* Add new companies and customize CTC / batch eligibility.
* Publish confirmed campus placement drives.
* Add verified questions and suggested model answers.
* Moderate student-submitted experiences and review feedback.
* Trigger AI historical dataset recalculations.

---

## 🎨 Design System & Visual Palette
* **Primary Brand**: `#4F46E5` (Indigo 600)
* **Primary Dark**: `#3730A3` (Indigo 800)
* **Background**: `#F8FAFC` (Slate 50)
* **Card Background**: `#FFFFFF`
* **Main Text**: `#0F172A` (Slate 900)
* **Secondary Text**: `#64748B` (Slate 500)
* **Success**: `#16A34A` (Emerald 600)
* **Warning**: `#F59E0B` (Amber 500)
