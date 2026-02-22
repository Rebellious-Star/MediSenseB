# Prompt for AI: Generate a Detailed ER Diagram for MediSense

Use the following project summary to create a **detailed Entity-Relationship (ER) diagram** covering every aspect of the MediSense project. The diagram should be comprehensive and suitable for documentation or database design.

---

## Project Overview

**Name:** MediSense  
**Type:** Healthcare intelligence web application (React + TypeScript + Vite, client-side with optional cloud AI).  
**Purpose:** Lets users upload medical reports (PDF, Word, or images), extract text (including OCR for images), analyze content via AI or built-in logic, and view structured results: summary, key findings, symptoms to monitor, prevention tips, future suggestions, and recommendations. The app also offers a voice symptom analyzer (UI only; recording/transcription not wired to backend) and informational pages (features, how it works, contact).

**Tech context:** Frontend-only by default; no persistent database in the current codebase. Treat the following as **conceptual entities and relationships** that would exist in a full system (user accounts, stored reports, analysis history) or that describe the **data structures and flows** inside the app.

---

## High-Level Modules / Features

1. **Authentication & identity** – Login, Sign up, session (UI only; no real backend).
2. **Report upload & processing** – File upload (PDF/Word/images), validation, text extraction (PDF.js, Mammoth, Tesseract.js), then analysis.
3. **Report analysis** – Extracted text is sent to OpenAI (if API key set) or to a built-in mock analyzer; output is a structured Analysis Result.
4. **Dashboard** – User-facing summary: recent reports (mock), health metrics (mock), upcoming appointments (mock), quick actions (Upload Report, Voice Analyzer).
5. **Voice analyzer** – Record symptoms (UI); sample analysis structure (symptoms, possible conditions, recommendations).
6. **Content & marketing** – Home (diseases, age categories, testimonials, feature showcase), Features, How it works, Contact (form, FAQ, contact info).
7. **Navigation & layout** – Header (nav links, language selector, Login/Sign up), Footer (links, brand, copyright), Root layout (Header + Outlet + Footer).

---

## Entities and Attributes

Define the following entities with the listed attributes. Include primary keys (e.g. id) where useful for the diagram.

### User (conceptual; for future auth/persistence)
- **user_id** (PK)
- email
- password (hashed)
- display_name
- created_at
- **Relationships:** has many ReportUploads; has one Dashboard; has many Sessions.

### Session (conceptual; login state)
- **session_id** (PK)
- user_id (FK)
- token_or_session_ref
- created_at, expires_at
- **Relationships:** belongs to User.

### ReportUpload (one upload instance)
- **upload_id** (PK)
- user_id (FK, optional if anonymous)
- file_name
- file_type (enum: PDF, DOC, DOCX, PNG, JPG, JPEG)
- file_size_bytes
- max_size_mb (constraint: 10)
- status (enum: idle, uploading, analyzing, done, error)
- created_at
- **Relationships:** produces one ExtractedText; produces zero or one AnalysisResult; belongs to User (optional).

### FileValidation
- **validation_id** (PK) or treat as value object under ReportUpload
- upload_id (FK)
- is_accepted_type (boolean)
- is_within_size_limit (boolean)
- error_message (nullable)
- **Relationships:** belongs to ReportUpload.

### ExtractedText
- **extraction_id** (PK)
- upload_id (FK)
- raw_text (long text)
- extraction_method (enum: pdfjs, mammoth, tesseract_ocr)
- **Relationships:** one-to-one with ReportUpload; feeds one AnalysisResult.

### AnalysisResult (main output of analysis)
- **result_id** (PK)
- upload_id or extraction_id (FK)
- summary (text)
- disclaimer (text)
- created_at
- analysis_provider (enum: openai, mock)
- **Relationships:** has many Findings; has one set each of Symptoms, Prevention, FutureSuggestions, Recommendations (as lists). Produced by one ReportUpload/ExtractedText.

### Finding (one key finding in a result)
- **finding_id** (PK)
- result_id (FK)
- label (e.g. "Glucose", "HbA1c")
- value (e.g. "See report")
- status (enum: normal, attention, critical)
- note (optional text)
- **Relationships:** many-to-one AnalysisResult.

### Symptom (possible symptom to monitor)
- **symptom_id** (PK) or ordinal in list
- result_id (FK)
- description (text)
- **Relationships:** many-to-one AnalysisResult.

### Prevention (prevention / lifestyle tip)
- **prevention_id** (PK) or ordinal
- result_id (FK)
- tip_text (text)
- **Relationships:** many-to-one AnalysisResult.

### FutureSuggestion (follow-up / monitoring suggestion)
- **suggestion_id** (PK) or ordinal
- result_id (FK)
- suggestion_text (text)
- **Relationships:** many-to-one AnalysisResult.

### Recommendation (immediate/short-term recommendation)
- **recommendation_id** (PK) or ordinal
- result_id (FK)
- recommendation_text (text)
- **Relationships:** many-to-one AnalysisResult.

### Dashboard (conceptual; one per user)
- **dashboard_id** (PK)
- user_id (FK)
- welcome_message (e.g. "Welcome back, John!")
- **Relationships:** has many RecentReport (mock); has many HealthMetric (mock); has many UpcomingAppointment (mock); belongs to User.

### RecentReport (mock list item on dashboard)
- **recent_report_id** (PK)
- dashboard_id (FK)
- title (e.g. "Blood Test Results")
- date (relative, e.g. "2 days ago")
- status (e.g. Reviewed, Pending)
- color (UI hint)
- **Relationships:** many-to-one Dashboard.

### HealthMetric (mock metric on dashboard)
- **metric_id** (PK)
- dashboard_id (FK)
- label (e.g. Blood Pressure, Heart Rate)
- value (e.g. "120/80", "72 bpm")
- status (e.g. Normal, Good)
- icon_ref, color
- **Relationships:** many-to-one Dashboard.

### UpcomingAppointment (mock)
- **appointment_id** (PK)
- dashboard_id (FK)
- title, date, time, doctor_name
- **Relationships:** many-to-one Dashboard.

### VoiceRecording (conceptual; voice analyzer)
- **recording_id** (PK)
- user_id (FK, optional)
- status (idle, recording, complete)
- **Relationships:** may produce one VoiceAnalysisResult (sample structure in app).

### VoiceAnalysisResult (sample structure in UI)
- symptoms (list of strings)
- possible_conditions (list of strings)
- recommendations (list of strings)
- **Relationships:** one-to-one with VoiceRecording (conceptual).

### Disease (informational; home page)
- **disease_id** or name (PK)
- name (e.g. Diabetes, Hypertension)
- icon_ref, gradient_style
- **Relationships:** referenced by HomePage content; no FK to Report or User in current app.

### AgeCategory (informational; home page)
- **age_category_id** (PK)
- title (e.g. "Children (0-17 years)")
- description, features (list), image_url, style_refs
- **Relationships:** content entity only.

### Testimonial (home page)
- **testimonial_id** (PK)
- name, role, content, image_url
- **Relationships:** content only.

### ContactInfo (contact page)
- **contact_info_id** (PK)
- title (Email Us, Call Us, Visit Us, Business Hours)
- details (list of strings)
- icon_ref, color
- **Relationships:** content only.

### FAQ (contact page)
- **faq_id** (PK)
- question, answer
- **Relationships:** content only.

### ContactSubmission (contact form; conceptual)
- **submission_id** (PK)
- name, email, subject, message, submitted_at
- **Relationships:** could belong to User if logged in.

### NavigationLink (header/footer)
- **link_id** (PK)
- path (e.g. /, /upload-report, /features)
- label (e.g. Home, Upload Report)
- **Relationships:** part of Layout/Header/Footer.

### Language (header selector)
- **language_code** (PK)
- name (e.g. English, Hindi)
- **Relationships:** user preference (conceptual).

### External system: OpenAI API
- **Provider** for analysis when VITE_OPENAI_API_KEY is set.
- **Input:** ExtractedText (truncated).
- **Output:** JSON that maps to AnalysisResult (summary, findings, symptoms, prevention, futureSuggestions, recommendations, disclaimer).
- Show as **external entity** or **actor** that “produces” or “returns” AnalysisResult.

### Configuration / Environment
- **EnvConfig** (conceptual): VITE_OPENAI_API_KEY (optional), app name, base URL, etc. Used by Analysis module to decide OpenAI vs mock.

---

## Relationships Summary (for ER diagram)

- **User** 1 —— N **ReportUpload**
- **User** 1 —— 1 **Dashboard**
- **User** 1 —— N **Session**
- **ReportUpload** 1 —— 1 **FileValidation**
- **ReportUpload** 1 —— 1 **ExtractedText**
- **ReportUpload** 1 —— 0..1 **AnalysisResult**
- **ExtractedText** 1 —— 0..1 **AnalysisResult**
- **AnalysisResult** 1 —— N **Finding**
- **AnalysisResult** 1 —— N **Symptom** (list)
- **AnalysisResult** 1 —— N **Prevention** (list)
- **AnalysisResult** 1 —— N **FutureSuggestion** (list)
- **AnalysisResult** 1 —— N **Recommendation** (list)
- **Dashboard** 1 —— N **RecentReport**
- **Dashboard** 1 —— N **HealthMetric**
- **Dashboard** 1 —— N **UpcomingAppointment**
- **OpenAI API** (external) —— returns data that populates **AnalysisResult**
- **ReportUpload** uses **ExtractionMethod** (pdfjs | mammoth | tesseract_ocr) depending on **FileType**.

Include **cardinalities** (1:1, 1:N, N:1) and **optionality** (mandatory/optional) on every relationship. Show **weak entities** (e.g. Finding, Symptom) where they depend on AnalysisResult.

---

## Key Processes to Reflect in the Diagram (as flows or notes)

1. **Upload flow:** User selects file → Validate (type, size) → Extract text (by file type) → Analyze text (OpenAI or mock) → Store/display AnalysisResult and its child lists (Findings, Symptoms, Prevention, FutureSuggestions, Recommendations).
2. **Auth flow (UI):** Login/Sign up forms (email, password) → redirect to Dashboard; no persistent Session in current app.
3. **Dashboard:** User sees RecentReports, HealthMetrics, UpcomingAppointments (all mock) and quick actions to Upload Report and Voice Analyzer.
4. **Voice analyzer:** Record → (conceptual) VoiceAnalysisResult with symptoms, possible_conditions, recommendations.
5. **Content:** Home shows Diseases, AgeCategories, Testimonials, FeatureShowcase; Contact shows ContactInfo, FAQ, ContactSubmission form.

---

## Diagram Requirements

- Include **every entity** and **relationship** described above.
- Use **clear naming** (e.g. ReportUpload, AnalysisResult, Finding) and **standard ER notation** (rectangles for entities, diamonds for relationships, ovals for attributes if desired, or attribute list inside entity boxes).
- Show **primary keys** and **foreign keys**.
- Differentiate **conceptual / future** entities (e.g. User, Session, ContactSubmission) vs **current data structures** (AnalysisResult, Finding, ExtractedText).
- Show **external system** (OpenAI) and **configuration** (EnvConfig) where they influence AnalysisResult.
- Optionally add a **small process flow** or **notes** for: file type → extraction method, and analysis provider (OpenAI vs mock) → AnalysisResult.
- If the diagram is split into **modules** (e.g. Upload & Analysis, Dashboard, Content, Auth), show how they connect (e.g. User, ReportUpload, AnalysisResult).

Use this prompt to generate a single, detailed ER diagram (description in text, Mermaid, or another diagram format as requested) covering all aspects of the MediSense project as specified above.
