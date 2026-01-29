
export enum View {
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  USER_TRAINING = 'USER_TRAINING',
  ASSESSMENT_DESIGNER = 'ASSESSMENT_DESIGNER',
  TRAINING_ARCHIVE = 'TRAINING_ARCHIVE',
  COURSE_CONTAINER = 'COURSE_CONTAINER',
  DATA_SUMMARY = 'DATA_SUMMARY',
  ANNUAL_PLAN = 'ANNUAL_PLAN',
  ORG_SETTINGS = 'ORG_SETTINGS'
}

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface KPI {
  label: string;
  value: string | number;
  trend?: string;
  status?: string;
  progress?: number;
  footer?: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  version: string;
  progress: number;
  status: 'overdue' | 'pending' | 'ready' | 'completed';
  dueDate?: string;
  isMandatory?: boolean;
}

export interface Cert {
  id: string;
  name: string;
  certId: string;
  expiryDate: string;
  remainingDays: number;
  status: 'expiring' | 'active' | 'expired';
}

export interface AuditLogItem {
  timestamp: string;
  title: string;
  description: string;
  actor: string;
  signedBy?: string;
  icon: string;
}

/**
 * Interface representing a UI component structure for the layout builder.
 */
export interface BuilderComponent {
  id: string;
  type: 'heading' | 'text' | 'button' | 'input' | 'card' | 'badge' | 'spacer';
  props: any;
}
