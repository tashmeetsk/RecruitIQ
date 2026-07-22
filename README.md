# RecruitIQ

**An intelligent recruitment knowledge management system.**

Recruiters talk to hundreds of candidates, and valuable details — preferred roles, salary expectations, notice period, WFH preference, relocation willingness, shift preference, career interests — usually end up scattered across Excel sheets and personal notes, never to be reused. RecruitIQ fixes that: it turns resumes, recruiter chat notes, and voice notes into structured, searchable candidate data, so when a similar job opens up weeks or months later, past candidates can be resurfaced instead of re-sourced from scratch.

---

## ✨ Features

- **AI-powered candidate intake** — upload a resume (PDF/DOCX/image), paste or screenshot chat notes, or attach a voice note. AI extracts structured details automatically.
- **Editable review before saving** — extracted data is shown for human review/correction, never auto-saved blindly.
- **Duplicate detection** — warns if a candidate with the same email/phone already exists.
- **Job openings management** — create and track open roles by category.
- **Candidate matching** — search candidates by role category and status for any job opening.
- **Status tracking per job** — a candidate can be `matched`, `rejected`, `open_for_future`, `interested`, or `contacted` — tracked separately for each job they're considered for, so history is never lost.
- **Verification tracking** — every status update records who made the change and when the candidate was last confirmed available.
- **Dashboard overview** — quick view of total candidates, active jobs, and placements.

---

## 📸 Screenshots

<!-- Add screenshots below. Suggested sections: -->

### Dashboard
<!-- screenshot here -->

### Add Candidate Flow
<!-- screenshot here -->

### Candidate Extraction Review
<!-- screenshot here -->

### Candidates List
<!-- screenshot here -->

### Job Openings
<!-- screenshot here -->

### Candidate Matching / Status Update
<!-- screenshot here -->

---

## 🏗️ Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js / Express
- **Database:** PostgreSQL (via Drizzle ORM)
- **AI Extraction:** Gemini API (multimodal — handles PDF, images, and audio directly)

---

## 🗄️ Database Schema

Four core tables:

- **`candidates`** — core profile info (name, contact, resume text, skills, source)
- **`candidate_preferences`** — AI-extracted preferences (desired role + standardized category, salary expectation, notice period, WFH preference, relocation willingness, shift preference, career interests, last verified date)
- **`job_openings`** — job roles being hired for
- **`candidate_job_status`** — junction table tracking each candidate's status *per job opening* over time (who updated it, when), which is what allows a candidate to be resurfaced for a different role later even if they didn't fit an earlier one

---

## 🚀 Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variable:
   ```
   GEMINI_API_KEY=your_key_here
   ```
4. Run database migrations (schema is defined via Drizzle ORM)
5. Start the app:
   ```
   npm run dev
   ```

---

## 👥 Team

Built by Tashmeet and team.

---

## 📌 Status

Actively in development — MVP built for internal use, with plans to expand (Power BI analytics integration, broader team/company use).
