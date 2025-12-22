
import { z } from "zod";

// --- Schemas de Validación (Zod) ---

export const FeatureStatusSchema = z.enum(['Backlog', 'InProgress', 'Review', 'Done']);
export const FeaturePrioritySchema = z.enum(['High', 'Medium', 'Low']);
export const FeatureTypeSchema = z.enum(['Epic', 'Feature', 'Task']);

export const FeatureSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  type: FeatureTypeSchema,
  status: FeatureStatusSchema,
  priority: FeaturePrioritySchema,
  points: z.number().nonnegative(),
  assigneeId: z.string().nullable(),
  tag: z.string(),
  tagColor: z.string(),
  parentId: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Feature = z.infer<typeof FeatureSchema>;
export type FeatureStatus = z.infer<typeof FeatureStatusSchema>;
export type FeaturePriority = z.infer<typeof FeaturePrioritySchema>;
export type FeatureType = z.infer<typeof FeatureTypeSchema>;

// --- Tipos Existentes ---

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum SidebarTab {
  Dashboard = 'Dashboard',
  Editor = 'Editor',
  Calendar = 'Calendar',
  Translation = 'Translation',
  KnowledgeBase = 'KnowledgeBase',
  FeatureTracker = 'FeatureTracker',
  Tutorials = 'Tutorials',
  Newspaper = 'Newspaper',
  OCR = 'OCR',
  Audio = 'Audio',
  Mockup = 'Mockup',
  WorkflowStudio = 'WorkflowStudio',
  TaskManager = 'TaskManager',
  ProjectManager = 'ProjectManager',
  Notes = 'Notes',
  Reader = 'Reader',
  Settings = 'Settings'
}

export enum UserRole {
  Admin = 'Admin',
  Member = 'Member',
  Viewer = 'Viewer'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // URL or base64 placeholder
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: string;
}

export interface GuideCardProps {
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  image: string;
}

export type AgentType = 'chat' | 'editor';

export interface AgentConfig {
  id: string;
  name: string;
  type: AgentType;
  initialPrompt?: string;
}
