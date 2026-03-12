

A front-end prototype built with **React 19 + TypeScript + Vite + Tailwind CSS** that demonstrates a complete job workflow for an emergency services dispatch platform — connecting internal staff and field vendors to manage urgent service requests.

---

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

No backend, no auth, no environment variables needed. All data is in-memory mock data.

---

## What's Built

### 1. Staff Console (Internal View)
- **Kanban board** with 5 columns: New → Assigned → Accepted → In Progress → Completed
- Jobs sorted by urgency within each column (Critical first)
- **Live search** across job ID, customer name, service type, location, vendor name
- **Urgency filter** pills (All / Critical / High / Medium / Low)
- **4 stat cards** — Critical active, New unassigned, In Progress, Total Completed
- **Notification bell** with unread count badge and dropdown panel
- **Create Job button** — opens a modal form to submit new jobs directly from the board

### 2. Staff Job Detail
- Customer info: name, phone, location, address
- Job info: service type, created date, description, urgency, status
- **SLA timer** — shows elapsed time since creation with colour-coded warn/over thresholds per urgency level (e.g. Critical warns at 1h, breaches at 2h)
- **Vendor assignment** — dropdown to assign or reassign from 4 vendors, shows current vendor phone
- **Status control** — click any stage to update job status manually
- **Internal notes** — toggle between Internal (staff-only, amber) and Visible to vendor (blue) before submitting
- **Activity timeline** — chronological log of every event on the job

### 3. Vendor Directory (Staff View)
- Full-page vendor list at `/vendors` accessible from the Vendor Portal dropdown
- **Search** by name, specialty, or location
- **Category filter** pills (All / Plumbing / HVAC / Electrical / Gas)
- Each row shows: avatar with category colour, specialty tags, contact info, workload bar, active/completed counts

### 4. Vendor Profile (Staff View)
- Per-vendor detail page at `/vendors/:vendorId`
- Profile header with category stripe, avatar, specialty tags, clickable phone/email links
- Live **"On site"** badge when the vendor has a job In Progress
- Stats pills (Total / Active / Done)
- **Assigned Jobs table** with All / Active / Completed tabs and inline search

### 5. Vendor Portal
- Vendor identity header with real contact info (phone, email, specialty tags)
- Jobs grouped into Active / Awaiting Action / Completed sections, sorted by urgency
- Each card shows job ID, service type, customer name, description excerpt, location, date, urgency badge, status badge
- Urgency-color-coded cards (Critical = red tint, High = orange, Medium = amber, Low = indigo)

### 6. Vendor Job Detail
- Pipeline progress tracker (Assigned → Accepted → In Progress → Completed)
- Context-aware action button per current status:
  - **Assigned** → Accept This Job
  - **Accepted** → Start Work (with address shown)
  - **In Progress** → Mark Job Complete (opens note-entry flow)
- Customer contact details, full description, urgency + status badges
- Add notes (visible to dispatch staff, with placeholder relevant to service type)
- Photo upload placeholder

### 7. Cross-cutting
- **Toast notifications** — every status change and note triggers a bottom-right toast (auto-dismisses in 4s)
- **In-app notification panel** — full notification history with Mark All Read
- **Vendor Portal dropdown** in header — select any vendor to enter their portal view

