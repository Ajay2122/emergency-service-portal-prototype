// Status flow: New → Assigned → Accepted → In Progress → Completed
// This is a one-way pipeline — jobs cannot move backwards in normal flow.
export type JobStatus = 'New' | 'Assigned' | 'Accepted' | 'In Progress' | 'Completed';

// Urgency drives visual triage on the board — Critical jobs get red left-border,
// High gets orange, so dispatchers can triage at a glance without reading text.
export type Urgency = 'Critical' | 'High' | 'Medium' | 'Low';

export type TimelineEventType =
  | 'created'
  | 'assigned'
  | 'accepted'
  | 'declined'
  | 'status_update'
  | 'note_added'
  | 'completed'
  | 'photo_uploaded';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  message: string;
  actor: string;
  timestamp: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  isInternal: boolean; // Staff-only notes vs. notes visible to vendor
}

export interface Job {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  urgency: Urgency;
  location: string;
  address: string;
  status: JobStatus;
  assignedVendor: string | null;
  assignedVendorId: string | null;
  createdAt: string;
  description: string;
  notes: Note[];
  timeline: TimelineEvent[];
}

export interface Vendor {
  id: string;
  name: string;
  specialty: string[];
  phone: string;
  email: string;
  location: string;
  activeJobs: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  jobId?: string;
}
