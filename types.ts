
export enum View {
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  USER_TRAINING = 'USER_TRAINING',
  ASSESSMENT_DESIGNER = 'ASSESSMENT_DESIGNER',
  TRAINING_ARCHIVE = 'TRAINING_ARCHIVE',
  COURSE_CONTAINER = 'COURSE_CONTAINER',
  DATA_SUMMARY = 'DATA_SUMMARY',
  ANNUAL_PLAN = 'ANNUAL_PLAN',
  ORG_SETTINGS = 'ORG_SETTINGS',
  HIERARCHY_MANAGER = 'HIERARCHY_MANAGER',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  USER_PROFILE = 'USER_PROFILE',
  AUDIT_LOGS = 'AUDIT_LOGS',
  SYSTEM_MANAGEMENT = 'SYSTEM_MANAGEMENT'
}

export enum Role {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  QA_OFFICER = 'QA_OFFICER',
  EMPLOYEE = 'EMPLOYEE'
}

export interface Question {
  id: string;
  courseId: string;
  type: 'single' | 'multiple' | 'blank' | 'matching';
  content: string;
  options?: string[];
  answer: any;
  pairs?: { left: string; right: string }[];
  score: number;
  difficulty: 'Low' | 'Medium' | 'High';
  explanation?: string;
}

export interface Material {
  id: string;
  name: string;
  type: 'video' | 'pdf' | 'ppt' | 'doc';
  url: string;
  status: 'active' | 'paused';
  expiryDate: string;
  uploadDate: string;
  hours: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  version: string;
  category: string;
  status: 'active' | 'paused' | 'draft';
  lastUpdated: string;
  questionCount: number;
  materials: Material[];
  totalHours: number;
  hierarchyIds: string[];
}

export interface DigitalCert {
  id: string;
  name: string;
  fileUrl: string;
  issueDate: string;
  expiryDate: string;
  fingerprint: string; // SHA-256 simulation
}

export interface WorkExperience {
  company: string;
  position: string;
  period: string;
  description?: string;
}

export interface TransferRecord {
  date: string;
  fromDept: string;
  toDept: string;
  fromPos: string;
  toPos: string;
  reason: string;
  approver: string;
}

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  employeeId: string;
  role: Role;
  company: string;
  department: string;
  position: string;
  avatar: string;
  status: 'active' | 'suspended';
  lastLogin: string;
  digitalSignature?: string; // Base64 signature image
  signatureTimestamp?: string;
  certificates?: DigitalCert[];
  workExperience?: WorkExperience[];
  transferRecords?: TransferRecord[];
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorId: string;
  action: string;
  module: 'USER' | 'COURSE' | 'HIERARCHY' | 'SYSTEM';
  details: string;
  ip: string;
  severity: 'info' | 'warning' | 'danger';
}

export interface HierarchyNode {
  id: string;
  code: string;
  name: string;
  children: HierarchyNode[];
  // 扩展元数据字段，支持 OrgSettings 同步
  manager?: string;
  address?: string;
  isGxP?: boolean;
  riskLevel?: 'High' | 'Medium' | 'Low';
  isOpen?: boolean; // 用于 UI 展示状态
}

export interface KPI {
  label: string;
  value: string;
  trend: string;
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
  isMandatory?: boolean;
  dueDate?: string;
  planId?: string; // 关联的计划 ID
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PlanItem {
  id: string;
  targetCompanyIds: string[];
  targetDepartmentIds: string[];
  targetPositionIds: string[];
  courseIds: string[]; // 关联的课程 ID 列表
  courseProgress?: Record<string, number>; // 新增：每个课程的学习进度
  trainingTypes: string[];
  year: number;
  month: number;
  title: string;
  code: string;
  targetDescription: string;
  level: 'COMPANY' | 'DEPARTMENT' | 'POSITION';
  status: 'planned' | 'in-progress' | 'completed';
  owner: string;
  progress: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Cert {
  id: string;
  name: string;
  certId: string;
  expiryDate: string;
  remainingDays: number;
  status: 'expiring' | 'active';
}

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface BuilderComponent {
  id: string;
  type: 'heading' | 'text' | 'button' | 'input' | 'card' | 'badge' | 'spacer';
  props: any;
}
