import Table from 'cli-table3';
import {
  User,
  Workspace,
  WorkspaceUser,
  TimeEntry,
  Project,
  Client,
  Tag,
  Task,
  Organization,
  OrganizationUser,
  Group,
} from '../api/types';

export function formatUserTable(user: User): string {
  const table = new Table({
    head: ['Field', 'Value'],
    colWidths: [25, 50],
    wordWrap: true,
  });

  table.push(
    ['ID', String(user.id)],
    ['Email', user.email],
    ['Full Name', user.fullname],
    ['Timezone', user.timezone],
    ['Default Workspace', String(user.default_workspace_id)],
    ['Created At', user.created_at]
  );

  return table.toString();
}

export function formatWorkspacesTable(workspaces: Workspace[]): string {
  const table = new Table({
    head: ['ID', 'Name', 'Premium', 'Admin', 'Organization ID'],
    colWidths: [12, 30, 10, 10, 15],
    wordWrap: true,
  });

  workspaces.forEach((ws) => {
    table.push([
      String(ws.id),
      ws.name,
      ws.premium ? 'Yes' : 'No',
      ws.admin ? 'Yes' : 'No',
      ws.organization_id ? String(ws.organization_id) : '-',
    ]);
  });

  return table.toString();
}

export function formatWorkspaceUsersTable(users: WorkspaceUser[]): string {
  const table = new Table({
    head: ['ID', 'User ID', 'Name', 'Email', 'Admin', 'Active'],
    colWidths: [10, 12, 20, 30, 8, 8],
    wordWrap: true,
  });

  users.forEach((user) => {
    table.push([
      String(user.id),
      String(user.user_id),
      user.name || '-',
      user.email || '-',
      user.admin ? 'Yes' : 'No',
      user.active ? 'Yes' : 'No',
    ]);
  });

  return table.toString();
}

export function formatTimeEntriesTable(entries: TimeEntry[]): string {
  const table = new Table({
    head: ['ID', 'Description', 'Project ID', 'Start', 'Duration', 'Running'],
    colWidths: [12, 30, 12, 20, 12, 10],
    wordWrap: true,
  });

  entries.forEach((entry) => {
    const isRunning = entry.duration < 0;
    const duration = isRunning
      ? 'Running'
      : formatDuration(entry.duration);

    table.push([
      String(entry.id),
      entry.description || '-',
      entry.project_id ? String(entry.project_id) : '-',
      new Date(entry.start).toLocaleString(),
      duration,
      isRunning ? 'Yes' : 'No',
    ]);
  });

  return table.toString();
}

export function formatTimeEntryTable(entry: TimeEntry): string {
  const table = new Table({
    head: ['Field', 'Value'],
    colWidths: [20, 55],
    wordWrap: true,
  });

  const isRunning = entry.duration < 0;

  table.push(
    ['ID', String(entry.id)],
    ['Description', entry.description || '-'],
    ['Workspace ID', String(entry.workspace_id)],
    ['Project ID', entry.project_id ? String(entry.project_id) : '-'],
    ['Task ID', entry.task_id ? String(entry.task_id) : '-'],
    ['Billable', entry.billable ? 'Yes' : 'No'],
    ['Start', new Date(entry.start).toLocaleString()],
    ['Stop', entry.stop ? new Date(entry.stop).toLocaleString() : '-'],
    ['Duration', isRunning ? 'Running' : formatDuration(entry.duration)],
    ['Tags', entry.tags?.join(', ') || '-']
  );

  return table.toString();
}

export function formatProjectsTable(projects: Project[]): string {
  const table = new Table({
    head: ['ID', 'Name', 'Client ID', 'Active', 'Billable', 'Color'],
    colWidths: [12, 30, 12, 10, 10, 10],
    wordWrap: true,
  });

  projects.forEach((project) => {
    table.push([
      String(project.id),
      project.name,
      project.client_id ? String(project.client_id) : '-',
      project.active ? 'Yes' : 'No',
      project.billable ? 'Yes' : 'No',
      project.color,
    ]);
  });

  return table.toString();
}

export function formatProjectTable(project: Project): string {
  const table = new Table({
    head: ['Field', 'Value'],
    colWidths: [25, 50],
    wordWrap: true,
  });

  table.push(
    ['ID', String(project.id)],
    ['Name', project.name],
    ['Workspace ID', String(project.workspace_id)],
    ['Client ID', project.client_id ? String(project.client_id) : '-'],
    ['Active', project.active ? 'Yes' : 'No'],
    ['Billable', project.billable ? 'Yes' : 'No'],
    ['Private', project.is_private ? 'Yes' : 'No'],
    ['Color', project.color],
    ['Created At', project.created_at || '-']
  );

  return table.toString();
}

export function formatClientsTable(clients: Client[]): string {
  const table = new Table({
    head: ['ID', 'Name', 'Workspace ID', 'Archived', 'Notes'],
    colWidths: [12, 25, 15, 10, 30],
    wordWrap: true,
  });

  clients.forEach((client) => {
    table.push([
      String(client.id),
      client.name,
      String(client.wid || client.workspace_id || '-'),
      client.archived ? 'Yes' : 'No',
      client.notes || '-',
    ]);
  });

  return table.toString();
}

export function formatClientTable(client: Client): string {
  const table = new Table({
    head: ['Field', 'Value'],
    colWidths: [20, 55],
    wordWrap: true,
  });

  table.push(
    ['ID', String(client.id)],
    ['Name', client.name],
    ['Workspace ID', String(client.wid || client.workspace_id || '-')],
    ['Archived', client.archived ? 'Yes' : 'No'],
    ['Notes', client.notes || '-'],
    ['Updated At', client.at]
  );

  return table.toString();
}

export function formatTagsTable(tags: Tag[]): string {
  const table = new Table({
    head: ['ID', 'Name', 'Workspace ID'],
    colWidths: [12, 40, 15],
    wordWrap: true,
  });

  tags.forEach((tag) => {
    table.push([String(tag.id), tag.name, String(tag.workspace_id)]);
  });

  return table.toString();
}

export function formatTasksTable(tasks: Task[]): string {
  const table = new Table({
    head: ['ID', 'Name', 'Project ID', 'Active', 'Estimated', 'Tracked'],
    colWidths: [12, 30, 12, 10, 12, 12],
    wordWrap: true,
  });

  tasks.forEach((task) => {
    table.push([
      String(task.id),
      task.name,
      String(task.project_id),
      task.active ? 'Yes' : 'No',
      task.estimated_seconds
        ? formatDuration(task.estimated_seconds)
        : '-',
      task.tracked_seconds ? formatDuration(task.tracked_seconds) : '-',
    ]);
  });

  return table.toString();
}

export function formatTaskTable(task: Task): string {
  const table = new Table({
    head: ['Field', 'Value'],
    colWidths: [20, 55],
    wordWrap: true,
  });

  table.push(
    ['ID', String(task.id)],
    ['Name', task.name],
    ['Workspace ID', String(task.workspace_id)],
    ['Project ID', String(task.project_id)],
    ['Active', task.active ? 'Yes' : 'No'],
    [
      'Estimated',
      task.estimated_seconds
        ? formatDuration(task.estimated_seconds)
        : '-',
    ],
    [
      'Tracked',
      task.tracked_seconds ? formatDuration(task.tracked_seconds) : '-',
    ]
  );

  return table.toString();
}

export function formatOrganizationTable(org: Organization): string {
  const table = new Table({
    head: ['Field', 'Value'],
    colWidths: [25, 50],
    wordWrap: true,
  });

  table.push(
    ['ID', String(org.id)],
    ['Name', org.name],
    ['User Count', org.user_count ? String(org.user_count) : '-'],
    ['Max Workspaces', org.max_workspaces ? String(org.max_workspaces) : '-'],
    ['Admin', org.admin ? 'Yes' : 'No'],
    ['Owner', org.owner ? 'Yes' : 'No']
  );

  return table.toString();
}

export function formatOrganizationUsersTable(users: OrganizationUser[]): string {
  const table = new Table({
    head: ['ID', 'User ID', 'Name', 'Email', 'Admin', 'Owner'],
    colWidths: [10, 12, 20, 30, 8, 8],
    wordWrap: true,
  });

  users.forEach((user) => {
    table.push([
      String(user.id),
      String(user.user_id),
      user.name || '-',
      user.email || '-',
      user.admin ? 'Yes' : 'No',
      user.owner ? 'Yes' : 'No',
    ]);
  });

  return table.toString();
}

export function formatGroupsTable(groups: Group[]): string {
  const table = new Table({
    head: ['Group ID', 'Name', 'Users Count', 'Workspaces Count'],
    colWidths: [12, 35, 15, 18],
    wordWrap: true,
  });

  groups.forEach((group) => {
    table.push([
      String(group.group_id),
      group.name,
      group.users ? String(group.users.length) : '0',
      group.workspaces ? String(group.workspaces.length) : '0',
    ]);
  });

  return table.toString();
}

export function formatGroupTable(group: Group): string {
  const table = new Table({
    head: ['Field', 'Value'],
    colWidths: [20, 55],
    wordWrap: true,
  });

  table.push(
    ['Group ID', String(group.group_id)],
    ['Name', group.name],
    ['Users', group.users?.map((u) => u.name || u.user_id).join(', ') || '-'],
    ['Workspaces', group.workspaces?.join(', ') || '-']
  );

  return table.toString();
}

export function formatGenericTable(
  data: Array<Record<string, unknown>>
): string {
  if (data.length === 0) {
    return 'No data to display';
  }

  const keys = Object.keys(data[0]);
  const table = new Table({
    head: keys,
  });

  data.forEach((item) => {
    const row = keys.map((key) => {
      const value = item[key];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });
    table.push(row);
  });

  return table.toString();
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}
