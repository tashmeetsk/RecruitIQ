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
<img width="1911" height="914" alt="image" src="https://github.com/user-attachments/assets/4b8e73bd-59fd-45a6-9c91-f0f0a6b6d947" />


### Add Candidate Flow
<img width="906" height="687" alt="image" src="https://github.com/user-attachments/assets/7609aad1-b550-4cda-8ace-c5215de01883" />


### Candidate Extraction Review
<img width="709" height="850" alt="image" src="https://github.com/user-attachments/assets/fdd10ce7-5bc3-432d-aeb1-a747ad5faa94" />


### Candidates List
<img width="1915" height="916" alt="image" src="https://github.com/user-attachments/assets/258569a9-66f1-450b-8016-9a2a789c751a" />


### Job Openings
<img width="1915" height="918" alt="image" src="https://github.com/user-attachments/assets/3f294461-a498-443b-9764-c9f57397a0e3" />


### Candidate Matching / Status Update
<img width="1914" height="917" alt="image" src="https://github.com/user-attachments/assets/576fd6ef-544c-4046-bcc6-fd040b4f95fd" />


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
