// Re-export types from schemas
export type {
  User,
  UserPreferences,
  Workspace,
  WorkspaceUser,
  TimeEntry,
  TimeEntryCreate,
  Project,
  ProjectCreate,
  Client,
  ClientCreate,
  Tag,
  TagCreate,
  Task,
  TaskCreate,
  Organization,
  OrganizationUser,
  Group,
  GroupCreate,
  Quota,
} from './schemas';

// Command options types
export interface GlobalOptions {
  apiToken?: string;
  workspace?: string;
  format?: 'json' | 'table' | 'csv';
  verbose?: boolean;
}

export interface ListTimeEntriesOptions extends GlobalOptions {
  startDate?: string;
  endDate?: string;
}

export interface CreateTimeEntryOptions extends GlobalOptions {
  description?: string;
  project?: string;
  task?: string;
  tags?: string;
  billable?: boolean;
  start?: string;
  duration?: string;
}

export interface ListProjectsOptions extends GlobalOptions {
  active?: boolean;
  clientId?: string;
}

export interface CreateProjectOptions extends GlobalOptions {
  name: string;
  clientId?: string;
  color?: string;
  private?: boolean;
  billable?: boolean;
}

export interface ListClientsOptions extends GlobalOptions {
  status?: 'active' | 'archived' | 'both';
}

export interface CreateClientOptions extends GlobalOptions {
  name: string;
  notes?: string;
}

export interface ListTasksOptions extends GlobalOptions {
  project: string;
  active?: boolean;
}

export interface CreateTaskOptions extends GlobalOptions {
  name: string;
  project: string;
  estimatedSeconds?: number;
}

export interface ListGroupsOptions extends GlobalOptions {
  organization: string;
}

export interface CreateGroupOptions extends GlobalOptions {
  organization: string;
  name: string;
}
