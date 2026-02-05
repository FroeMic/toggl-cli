import { z } from 'zod';

// Common schemas
export const TimestampSchema = z.string();

// User / Me schemas
export const UserSchema = z.object({
  id: z.number(),
  api_token: z.string().optional(),
  email: z.string().email(),
  fullname: z.string(),
  timezone: z.string(),
  default_workspace_id: z.number(),
  beginning_of_week: z.number(),
  image_url: z.string().nullable(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema.optional(),
  country_id: z.number().nullable().optional(),
  has_password: z.boolean().optional(),
  at: TimestampSchema.optional(),
  intercom_hash: z.string().optional(),
  openid_enabled: z.boolean().optional(),
  openid_email: z.string().nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const UserPreferencesSchema = z.object({
  date_format: z.string().optional(),
  duration_format: z.string().optional(),
  timeofday_format: z.string().optional(),
  record_timeline: z.boolean().optional(),
  send_product_emails: z.boolean().optional(),
  send_weekly_report: z.boolean().optional(),
  send_timer_notifications: z.boolean().optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Workspace schemas
export const WorkspaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile: z.number().optional(),
  premium: z.boolean(),
  business_ws: z.boolean().optional(),
  admin: z.boolean().optional(),
  default_hourly_rate: z.number().nullable().optional(),
  default_currency: z.string().optional(),
  only_admins_may_create_projects: z.boolean().optional(),
  only_admins_may_create_tags: z.boolean().optional(),
  only_admins_see_billable_rates: z.boolean().optional(),
  only_admins_see_team_dashboard: z.boolean().optional(),
  projects_billable_by_default: z.boolean().optional(),
  projects_private_by_default: z.boolean().optional(),
  rounding: z.number().optional(),
  rounding_minutes: z.number().optional(),
  api_token: z.string().optional(),
  at: TimestampSchema.optional(),
  logo_url: z.string().nullable().optional(),
  ical_url: z.string().nullable().optional(),
  ical_enabled: z.boolean().optional(),
  csv_upload: z.unknown().nullable().optional(),
  subscription: z.unknown().nullable().optional(),
  organization_id: z.number().optional(),
  suspended_at: z.string().nullable().optional(),
  server_deleted_at: z.string().nullable().optional(),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;

export const WorkspaceUserSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  workspace_id: z.number(),
  admin: z.boolean(),
  active: z.boolean(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  inactive: z.boolean().optional(),
  at: TimestampSchema.optional(),
  avatar_file_name: z.string().nullable().optional(),
  group_ids: z.array(z.number()).optional(),
  rate: z.number().nullable().optional(),
  rate_last_updated: z.string().nullable().optional(),
  labour_cost: z.number().nullable().optional(),
  invite_url: z.string().nullable().optional(),
  invitation_code: z.string().nullable().optional(),
  timezone: z.string().optional(),
});

export type WorkspaceUser = z.infer<typeof WorkspaceUserSchema>;

// Time Entry schemas
export const TimeEntrySchema = z.object({
  id: z.number(),
  workspace_id: z.number(),
  project_id: z.number().nullable(),
  task_id: z.number().nullable().optional(),
  billable: z.boolean(),
  start: TimestampSchema,
  stop: TimestampSchema.nullable(),
  duration: z.number(), // Negative if running
  description: z.string().nullable(),
  tags: z.array(z.string()).nullable().optional(),
  tag_ids: z.array(z.number()).nullable().optional(),
  duronly: z.boolean().optional(),
  at: TimestampSchema,
  server_deleted_at: z.string().nullable().optional(),
  user_id: z.number(),
  uid: z.number().optional(),
  wid: z.number().optional(),
  pid: z.number().nullable().optional(),
  tid: z.number().nullable().optional(),
});

export type TimeEntry = z.infer<typeof TimeEntrySchema>;

export const TimeEntryCreateSchema = z.object({
  workspace_id: z.number(),
  description: z.string().optional(),
  project_id: z.number().optional(),
  task_id: z.number().optional(),
  billable: z.boolean().optional(),
  start: TimestampSchema,
  stop: TimestampSchema.optional(),
  duration: z.number(), // Negative for running timer (current timestamp as negative)
  tags: z.array(z.string()).optional(),
  tag_ids: z.array(z.number()).optional(),
  created_with: z.string(),
});

export type TimeEntryCreate = z.infer<typeof TimeEntryCreateSchema>;

// Project schemas
export const ProjectSchema = z.object({
  id: z.number(),
  workspace_id: z.number(),
  client_id: z.number().nullable(),
  name: z.string(),
  is_private: z.boolean(),
  active: z.boolean(),
  at: TimestampSchema,
  created_at: TimestampSchema.optional(),
  server_deleted_at: z.string().nullable().optional(),
  color: z.string(),
  billable: z.boolean().nullable().optional(),
  template: z.boolean().nullable().optional(),
  auto_estimates: z.boolean().nullable().optional(),
  estimated_hours: z.number().nullable().optional(),
  rate: z.number().nullable().optional(),
  rate_last_updated: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  recurring: z.boolean().optional(),
  recurring_parameters: z.unknown().nullable().optional(),
  current_period: z.unknown().nullable().optional(),
  fixed_fee: z.number().nullable().optional(),
  actual_hours: z.number().nullable().optional(),
  wid: z.number().optional(),
  cid: z.number().nullable().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectCreateSchema = z.object({
  name: z.string(),
  workspace_id: z.number().optional(),
  client_id: z.number().optional(),
  is_private: z.boolean().optional(),
  active: z.boolean().optional(),
  color: z.string().optional(),
  billable: z.boolean().optional(),
  auto_estimates: z.boolean().optional(),
  estimated_hours: z.number().optional(),
  rate: z.number().optional(),
  currency: z.string().optional(),
  template: z.boolean().optional(),
});

export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;

// Client schemas
export const ClientSchema = z.object({
  id: z.number(),
  wid: z.number().optional(),
  workspace_id: z.number().optional(),
  name: z.string(),
  at: TimestampSchema,
  archived: z.boolean().optional(),
  server_deleted_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type Client = z.infer<typeof ClientSchema>;

export const ClientCreateSchema = z.object({
  name: z.string(),
  wid: z.number().optional(),
  notes: z.string().optional(),
});

export type ClientCreate = z.infer<typeof ClientCreateSchema>;

// Tag schemas
export const TagSchema = z.object({
  id: z.number(),
  workspace_id: z.number(),
  name: z.string(),
  at: TimestampSchema,
  deleted_at: z.string().nullable().optional(),
});

export type Tag = z.infer<typeof TagSchema>;

export const TagCreateSchema = z.object({
  name: z.string(),
  workspace_id: z.number().optional(),
});

export type TagCreate = z.infer<typeof TagCreateSchema>;

// Task schemas
export const TaskSchema = z.object({
  id: z.number(),
  name: z.string(),
  workspace_id: z.number(),
  project_id: z.number(),
  user_id: z.number().nullable().optional(),
  active: z.boolean(),
  at: TimestampSchema,
  estimated_seconds: z.number().nullable().optional(),
  tracked_seconds: z.number().optional(),
  server_deleted_at: z.string().nullable().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const TaskCreateSchema = z.object({
  name: z.string(),
  workspace_id: z.number().optional(),
  project_id: z.number().optional(),
  user_id: z.number().optional(),
  active: z.boolean().optional(),
  estimated_seconds: z.number().optional(),
});

export type TaskCreate = z.infer<typeof TaskCreateSchema>;

// Organization schemas
export const OrganizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  pricing_plan_id: z.number().optional(),
  created_at: TimestampSchema.optional(),
  at: TimestampSchema.optional(),
  server_deleted_at: z.string().nullable().optional(),
  is_multi_workspace_enabled: z.boolean().optional(),
  suspended_at: z.string().nullable().optional(),
  user_count: z.number().optional(),
  trial_info: z.unknown().nullable().optional(),
  is_chargify: z.boolean().optional(),
  is_unified: z.boolean().optional(),
  max_workspaces: z.number().optional(),
  admin: z.boolean().optional(),
  owner: z.boolean().optional(),
});

export type Organization = z.infer<typeof OrganizationSchema>;

export const OrganizationUserSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  organization_id: z.number(),
  admin: z.boolean(),
  owner: z.boolean().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar_url: z.string().nullable().optional(),
  joined: z.boolean().optional(),
  inactive: z.boolean().optional(),
  groups: z
    .array(
      z.object({
        group_id: z.number(),
        name: z.string(),
      })
    )
    .optional(),
  workspaces: z
    .array(
      z.object({
        workspace_id: z.number(),
        name: z.string(),
        admin: z.boolean(),
      })
    )
    .optional(),
});

export type OrganizationUser = z.infer<typeof OrganizationUserSchema>;

// Group schemas
export const GroupSchema = z.object({
  group_id: z.number(),
  name: z.string(),
  at: TimestampSchema.optional(),
  users: z
    .array(
      z.object({
        user_id: z.number(),
        name: z.string().optional(),
      })
    )
    .optional(),
  workspaces: z.array(z.number()).optional(),
});

export type Group = z.infer<typeof GroupSchema>;

export const GroupCreateSchema = z.object({
  name: z.string(),
  users: z.array(z.number()).optional(),
  workspaces: z.array(z.number()).optional(),
});

export type GroupCreate = z.infer<typeof GroupCreateSchema>;

// API Quota schema - rate limit info per organization
export const OrganizationQuotaSchema = z.object({
  remaining: z.number(),
  total: z.number(),
  resets_in_secs: z.number(),
  organization_id: z.number(),
});

export type OrganizationQuota = z.infer<typeof OrganizationQuotaSchema>;

export const QuotaResponseSchema = z.array(OrganizationQuotaSchema);
export type QuotaResponse = z.infer<typeof QuotaResponseSchema>;

// Deprecated - keep for backwards compat
/** @deprecated Use OrganizationQuotaSchema instead */
export const QuotaSchema = z.object({
  requests_made: z.number().optional(),
  requests_allowed: z.number().optional(),
  requests_remaining: z.number().optional(),
  reset_at: TimestampSchema.optional(),
});
/** @deprecated Use OrganizationQuota instead */
export type Quota = z.infer<typeof QuotaSchema>;
