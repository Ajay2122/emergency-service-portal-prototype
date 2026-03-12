# DispatchIQ — Emergency Services Job Workflow Prototype

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
- Fully responsive layout

---

## File Structure

```
src/
├── App.tsx                        # Root shell: routing, header, vendor dropdown, toast bridge
├── main.tsx
├── index.css
│
├── pages/
│   ├── StaffDashboard.tsx         # Kanban board + stats + filters + Create Job button
│   ├── StaffJobDetail.tsx         # Staff job detail: SLA timer, notes, vendor assign, status control
│   ├── VendorList.tsx             # Staff vendor directory: search, category filter, workload rows
│   ├── VendorDetail.tsx           # Staff vendor profile: header, on-site badge, jobs table
│   ├── VendorPortal.tsx           # Vendor job list grouped by section
│   └── VendorJobDetail.tsx        # Vendor job detail: actions, notes, timeline
│
├── components/
│   ├── staff/
│   │   ├── CreateJobModal.tsx     # New job form: customer, location, service type, urgency, description
│   │   ├── KanbanColumn.tsx       # Single board column with sorted cards
│   │   └── StaffJobCard.tsx       # Compact kanban card with urgency left-border
│   ├── vendor/
│   │   ├── VendorCard.tsx         # Vendor card (grid view) with category stripe + job stats
│   │   ├── VendorJobsTable.tsx    # Tabbed jobs table (All/Active/Completed) with inline search
│   │   └── VendorSearch.tsx       # Shared search + category filter input component
│   └── common/
│       ├── StatusBadge.tsx        # Pill badge for job status
│       ├── UrgencyBadge.tsx       # Pill badge for urgency level
│       ├── NotificationBell.tsx   # Bell button + notification dropdown
│       ├── Timeline.tsx           # Activity log with typed icons per event
│       └── Toast.tsx              # Auto-dismiss toast notification
│
├── context/
│   ├── JobContext.tsx             # Job state: updateStatus, assignVendor, addNote
│   └── NotificationContext.tsx   # Notification list, unread count, markRead
│
├── data/
│   └── mockData.ts               # 10 jobs across all statuses + 4 vendors + seed notifications
│
└── types/
    └── index.ts                  # Job, Vendor, Note, TimelineEvent, Notification types
```

---


### 1. What assumptions did you make?

- **One-way status pipeline** — jobs move forward only (New → Assigned → Accepted → In Progress → Completed). Staff can override any status, but vendors can only advance.
- **Vendor sees only their jobs** — each vendor portal is scoped to their assigned jobs; no cross-vendor visibility.
- **No real-time sync** — all state is in React memory, shared via context. A real system would use WebSockets or polling. I simulated this by having both views read from the same `JobContext`.
- **Notes are scoped** — staff can write internal-only notes (not shown to vendor) or shared notes (visible to vendor). Vendors can only write shared notes.
- **Urgency is set at creation** — vendors cannot change urgency, only staff can (via status or a future edit flow).
- **"Completed Today"** stat was renamed to "Total Completed" since there's no real-time date comparison with mock data that has fixed timestamps.

### 2. What did you optimize for?

- **Triage speed** — the most critical information (urgency, status, customer, service type) is visible at a glance without opening a job. Critical jobs pulse red. Urgency drives card sort order within columns.
- **Vendor speed** — the vendor detail page is designed for a technician with one hand free: large tap targets, one bold primary action per screen state, no menus to navigate.
- **Minimal cognitive load** — each view surfaces only what matters for that role. Staff see assignment controls and internal notes. Vendors see job details and their single next action.
- **Real data, no placeholder text** — every piece of text on screen comes from actual job or vendor data. No lorem ipsum or hardcoded fake values.
- **Responsive layout** — kanban scrolls horizontally on small screens; detail pages collapse to single column on mobile.

### 3. What would you improve next if this were going to production?

**Functionality:**
- Real authentication with role-based access control (not URL-based switching)
- Vendor notification push (SMS/email when assigned) using a service like Twilio or SendGrid
- Photo upload with cloud storage (S3/Cloudflare R2), shown in the vendor job detail
- Customer portal — a third role to submit jobs and track status
- Drag-and-drop on the kanban board to move jobs between columns

**Data & State:**
- Replace context + mock data with a real API (REST or GraphQL)
- Optimistic updates with error rollback
- Offline support for vendors (service worker + IndexedDB) since field work often has poor connectivity

**Quality:**
- Unit tests for context reducers and utility functions
- Integration tests for the key workflows (assign → accept → complete cycle)
- Error boundary components so one broken job doesn't crash the board
- Accessibility audit — ARIA labels on icon buttons, keyboard navigation on kanban

**Operations:**
- Audit log stored server-side (currently the timeline is in-memory and resets on reload)
- SLA tracking persisted server-side (client-side SLA timer already implemented; thresholds and breach history need a backend)

### 4. Which AI tools did you use?

**Claude (claude.ai / Claude Code)** was used as a development assistant throughout this project for:
- Initial project scaffolding and TypeScript type definitions
- Component structure suggestions and refactoring
- UI layout and color system decisions
- Debugging TypeScript type errors

All business logic, data structures, workflow decisions, and architectural choices were reviewed and directed by the Me. The final code was tested, understood, and validated before submission — not blindly generated.

---

## Tech Stack

| Tool | Version | Why |
|---|---|---|
| React | 19 | Current stable, concurrent features available |
| TypeScript | 5 | Type safety across job/vendor/notification models |
| Vite | 6 | Fast HMR, instant dev server |
| Tailwind CSS | 3 | Utility-first, rapid layout iteration |
| React Router DOM | 7 | URL-based routing, role separation by path prefix |
| Lucide React | latest | Consistent, lightweight icon set |

---

## Mock Data Summary

| Vendor | Specialty | Jobs |
|---|---|---|
| Mike Plumbing Ltd | Emergency Plumbing, Frozen Pipes, Pipe Burst | JOB-1023, JOB-1027, JOB-1030, JOB-1032 |
| CoolAir Solutions | HVAC Emergency, Heating Failure, AC Failure | JOB-1024, JOB-1031 |
| PowerFix Inc | Emergency Electrical, Panel Failure, Power Outage | JOB-1026 |
| SafeGas Services | Gas Leak, Gas Line Repair | JOB-1029 |

10 jobs total spread across all 5 pipeline stages with a realistic urgency distribution (4 Critical, 4 High, 2 Medium).
