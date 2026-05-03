# Study Abroad University Platform — Required System Improvements

---

## 1. Problem Statement

### Current System Issues

**UX Deficiencies**
- No input mechanism for student profile data (GPA, IELTS score, budget)
- University listings are static with no personalization or filtering based on eligibility
- No decision-support guidance at any step of the user journey
- No comparison mechanism between universities or programs

**Missing Data**
- Tuition fee and living cost data absent or inconsistent
- No total cost estimation per program
- Admission requirements (GPA, IELTS) not displayed or not structured
- Scholarship availability not indicated
- Admission difficulty not categorized
- Intake session and application deadline data missing

**Lack of Decision Support**
- System does not filter universities based on student eligibility
- No ranked or personalized recommendation output
- No user flow guiding students from profile input to application
- No mechanism to compare options side by side

---

## 2. Proposed System Improvement

### Shift: Static Listing to Decision Support Platform

| Current State | Target State |
|---|---|
| Static university listing | Personalized university recommendations |
| No student profile input | Profile-based eligibility filtering |
| Incomplete program data | Structured, consistent data per program |
| No decision flow | Step-by-step guided user journey |
| No comparison tool | Side-by-side university comparison |

The system must transition from a passive directory into an active decision-support tool. All recommendations and filters must derive from structured data, not hardcoded logic, to allow future AI integration.

---

## 3. Required UI/UX Changes

### Homepage

- Add a student profile input form at the top of the homepage with the following fields:
  - GPA (numeric input, 0.0–4.0 or local scale)
  - IELTS score (numeric input, 0.0–9.0)
  - Budget range (min/max in USD or BDT, with currency selector)
- Upon form submission, display a filtered and ranked list of eligible universities
- Show a summary card per university: name, country, program, total cost, admission difficulty, and eligibility match status

### University Detail Page

Each university/program detail page must include:

- Tuition fee (per year, in USD)
- Living cost (per year, estimated average)
- Total cost estimation (tuition + living, auto-calculated)
- GPA requirement (minimum)
- IELTS requirement (minimum)
- Admission difficulty (Easy / Moderate / Competitive / Highly Competitive)
- Scholarship availability (Yes / No / Partial, with description if available)
- Intake sessions (e.g., Fall, Spring, Summer)
- Application deadline(s)
- English-medium allowed (Yes / No)
- Study gap allowed (Yes / No / With conditions)
- Direct application link

### Filters

Implement the following filter options on the listing page:

- Budget range (slider or min/max input)
- Minimum GPA requirement
- Minimum IELTS score
- Country (multi-select)
- Admission difficulty (multi-select: Easy, Moderate, Competitive, Highly Competitive)
- Degree level (Bachelor, Master, PhD)
- Scholarship available (toggle)
- Study gap allowed (toggle)

### Comparison Feature

- Allow users to select 2–4 universities for side-by-side comparison
- Comparison table must include all structured fields from the University Detail Page
- Highlight favorable values (e.g., lowest cost, lowest requirements) visually
- Provide a "Save Comparison" option (Phase 2)

---

## 4. Data Model Requirements

Each program record in the database must include the following fields:

| Field | Type | Notes |
|---|---|---|
| `university_name` | string | Full official name |
| `country` | string | ISO country name |
| `program_name` | string | Specific program/major name |
| `degree_level` | enum | bachelor, master, phd |
| `tuition_fee` | number | Annual fee in USD |
| `living_cost` | number | Estimated annual cost in USD |
| `total_cost` | number | Calculated: tuition_fee + living_cost |
| `gpa_requirement` | number | Minimum GPA on 4.0 scale |
| `ielts_requirement` | number | Minimum IELTS band score |
| `english_medium_allowed` | boolean | Whether SSC/HSC in English medium qualifies |
| `study_gap_allowed` | boolean or string | true / false / "conditional" |
| `admission_difficulty` | enum | easy, moderate, competitive, highly_competitive |
| `intake_sessions` | array of strings | e.g., ["Fall", "Spring"] |
| `application_deadline` | date or string | Per intake, if variable |
| `scholarship_available` | boolean | Whether any scholarship exists |
| `scholarship_details` | string | Description of scholarship type and amount |
| `application_url` | string | Direct URL to application portal |
| `created_at` | timestamp | Record creation date |
| `updated_at` | timestamp | Last update date |

**Notes:**
- `total_cost` should be calculated at write time and stored, not computed dynamically on each request
- All monetary values stored in USD; conversion to BDT applied at display layer
- `study_gap_allowed` may use a string value of `"conditional"` to support nuanced cases

---

## 5. User Flow Design

### Step-by-Step Flow

**Step 1 — Profile Input**
- User lands on homepage
- User enters GPA, IELTS score, and budget range
- System validates inputs and stores in session

**Step 2 — Eligibility Filtering**
- System queries the database for programs where:
  - `gpa_requirement <= user_gpa`
  - `ielts_requirement <= user_ielts`
  - `total_cost <= user_budget_max`
- Returns filtered program list

**Step 3 — Ranked Recommendations**
- Filtered results are sorted by:
  - Eligibility match strength (how well user exceeds requirements)
  - Affordability (total cost within budget)
  - Admission difficulty (easier options ranked higher for safety)
- User views ranked list with summary cards

**Step 4 — Comparison**
- User selects 2–4 universities to compare
- Side-by-side comparison table is rendered
- User can deselect and re-add options

**Step 5 — Selection and Application**
- User selects a preferred university
- User is directed to the university detail page
- User clicks the direct application link to proceed externally

---

## 6. MVP vs Future Scope

### MVP — Phase 1 (Implement First)

- University and program listing with all structured data fields populated
- Filter system (budget, GPA, IELTS, country, difficulty, degree level)
- Student profile input form on homepage
- Basic recommendation output (filtered and sorted list)
- University detail page with all required fields

### Phase 2

- User accounts with authentication
- Saved student profiles
- Saved university shortlists
- Full comparison tool with save/export functionality
- Admin interface for data entry and management

### Phase 3

- AI-based recommendation engine (model trained or prompted on student profiles and outcomes)
- Application tracking system (status, deadlines, document checklist)
- Notification system (deadline reminders, status updates)
- Community features (student reviews, acceptance data)

---

## 7. Implementation Notes

- **Modularity**: Separate concerns cleanly — data layer, recommendation/filter logic, and UI must be independently maintainable.
- **Data consistency**: All program records must conform to the defined data model. Incomplete records must not surface in recommendations.
- **No hardcoded logic**: Recommendation ranking and filtering must operate entirely from database values. Do not hardcode university names, thresholds, or rankings in application code.
- **AI integration readiness**: The recommendation logic must be designed as a service layer that can be swapped or augmented with an AI model in Phase 3 without requiring structural changes.
- **Scalability**: The data model and API must support adding new countries, programs, and fields without schema rewrites.
- **Localization**: Monetary values stored in USD but must support display conversion to BDT. Date formats must be configurable per locale.
- **API-first**: Build all data access through a documented API layer to support future mobile clients and third-party integrations.
