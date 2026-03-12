import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Job, JobStatus, Note, TimelineEvent, Vendor } from '../types';
import { INITIAL_JOBS, VENDORS } from '../data/mockData';

type NewJobInput = Pick<Job, 'customerName' | 'customerPhone' | 'serviceType' | 'urgency' | 'location' | 'address' | 'description'>;

interface JobContextValue {
  jobs: Job[];
  vendors: Vendor[];
  updateJobStatus: (jobId: string, newStatus: JobStatus, actor: string) => void;
  assignVendor: (jobId: string, vendorId: string, actor: string) => void;
  declineJob: (jobId: string, reason: string, actor: string) => void;
  addNote: (jobId: string, content: string, author: string, isInternal: boolean) => void;
  createJob: (data: NewJobInput, actor: string) => string;
  getJob: (jobId: string) => Job | undefined;
  getVendorJobs: (vendorId: string) => Job[];
}

const JobContext = createContext<JobContextValue | null>(null);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

  const updateJobStatus = useCallback((jobId: string, newStatus: JobStatus, actor: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;

      const eventMessages: Record<JobStatus, string> = {
        'New': 'Status reset to New',
        'Assigned': 'Job assigned to vendor',
        'Accepted': 'Vendor accepted the job',
        'In Progress': 'Work started — vendor on site',
        'Completed': 'Job marked complete',
      };

      const eventTypes: Record<JobStatus, TimelineEvent['type']> = {
        'New': 'status_update',
        'Assigned': 'assigned',
        'Accepted': 'accepted',
        'In Progress': 'status_update',
        'Completed': 'completed',
      };

      const newEvent: TimelineEvent = {
        id: `tl-${jobId}-${Date.now()}`,
        type: eventTypes[newStatus],
        message: eventMessages[newStatus],
        actor,
        timestamp: new Date().toLocaleString('sv-SE', { timeZone: 'America/Toronto' }).replace('T', ' ').slice(0, 16),
      };

      return {
        ...job,
        status: newStatus,
        timeline: [...job.timeline, newEvent],
      };
    }));
  }, []);

  const assignVendor = useCallback((jobId: string, vendorId: string, actor: string) => {
    const vendor = VENDORS.find(v => v.id === vendorId);
    if (!vendor) return;

    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;

      const newEvent: TimelineEvent = {
        id: `tl-${jobId}-${Date.now()}`,
        type: 'assigned',
        message: `Job assigned to ${vendor.name}`,
        actor,
        timestamp: new Date().toLocaleString('sv-SE', { timeZone: 'America/Toronto' }).replace('T', ' ').slice(0, 16),
      };

      return {
        ...job,
        assignedVendor: vendor.name,
        assignedVendorId: vendorId,
        status: 'Assigned' as JobStatus,
        timeline: [...job.timeline, newEvent],
      };
    }));
  }, []);

  const declineJob = useCallback((jobId: string, reason: string, actor: string) => {
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Toronto' }).replace('T', ' ').slice(0, 16);
    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const newEvent: TimelineEvent = {
        id: `tl-${jobId}-${Date.now()}`,
        type: 'declined',
        message: `Vendor declined — ${reason}`,
        actor,
        timestamp: now,
      };
      return {
        ...job,
        status: 'New' as JobStatus,
        assignedVendor: null,
        assignedVendorId: null,
        timeline: [...job.timeline, newEvent],
      };
    }));
  }, []);

  const addNote = useCallback((jobId: string, content: string, author: string, isInternal: boolean) => {
    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'America/Toronto' }).replace('T', ' ').slice(0, 16);

    const newNote: Note = {
      id: `note-${jobId}-${Date.now()}`,
      content,
      author,
      timestamp,
      isInternal,
    };

    const newTimelineEvent: TimelineEvent = {
      id: `tl-${jobId}-${Date.now()}`,
      type: 'note_added',
      message: `Note added by ${author}`,
      actor: author,
      timestamp,
    };

    setJobs(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      return {
        ...job,
        notes: [...job.notes, newNote],
        timeline: [...job.timeline, newTimelineEvent],
      };
    }));
  }, []);

  const createJob = useCallback((data: NewJobInput, actor: string): string => {
    const maxNum = jobs.reduce((max, j) => {
      const n = parseInt(j.id.replace('JOB-', ''), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 1000);
    const newId = `JOB-${maxNum + 1}`;
    const now   = new Date().toLocaleString('sv-SE', { timeZone: 'America/Toronto' }).replace('T', ' ').slice(0, 16);
    const newJob: Job = {
      ...data,
      id: newId,
      status: 'New',
      assignedVendor: null,
      assignedVendorId: null,
      createdAt: now,
      notes: [],
      timeline: [{
        id: `tl-${newId}-1`,
        type: 'created',
        message: 'Job created by dispatch staff',
        actor,
        timestamp: now,
      }],
    };
    setJobs(prev => [newJob, ...prev]);
    return newId;
  }, [jobs]);

  const getJob = useCallback((jobId: string) => {
    return jobs.find(j => j.id === jobId);
  }, [jobs]);

  const getVendorJobs = useCallback((vendorId: string) => {
    return jobs.filter(j => j.assignedVendorId === vendorId);
  }, [jobs]);

  return (
    <JobContext.Provider value={{ jobs, vendors: VENDORS, updateJobStatus, assignVendor, declineJob, addNote, createJob, getJob, getVendorJobs }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error('useJobs must be used inside JobProvider');
  return ctx;
}
