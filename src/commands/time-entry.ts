import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { TimeEntriesEndpoints } from '../api/endpoints/time-entries';
import { MeEndpoints } from '../api/endpoints/me';
import {
  formatJson,
  formatTimeEntriesTable,
  formatTimeEntryTable,
  formatCsv,
} from '../formatters';
import { getDefaultWorkspaceId } from '../utils/config';

async function getWorkspaceId(
  client: TogglClient,
  workspaceOption?: string
): Promise<number> {
  if (workspaceOption) {
    return parseInt(workspaceOption, 10);
  }

  const defaultWs = getDefaultWorkspaceId();
  if (defaultWs) {
    return parseInt(defaultWs, 10);
  }

  const meApi = new MeEndpoints(client);
  const user = await meApi.get();
  return user.default_workspace_id;
}

export function createTimeEntryCommand(): Command {
  const timeEntry = new Command('time-entry')
    .description('Manage time entries')
    .alias('te');

  timeEntry
    .command('list')
    .description('List time entries')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .option('--start-date <date>', 'Start date (ISO 8601)')
    .option('--end-date <date>', 'End date (ISO 8601)')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const timeEntriesApi = new TimeEntriesEndpoints(client);

        const entries = await timeEntriesApi.list({
          startDate: options.startDate,
          endDate: options.endDate,
        });

        if (options.format === 'table') {
          console.log(formatTimeEntriesTable(entries));
        } else if (options.format === 'csv') {
          console.log(formatCsv(entries));
        } else {
          console.log(formatJson(entries));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  timeEntry
    .command('current')
    .description('Get the currently running time entry')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const timeEntriesApi = new TimeEntriesEndpoints(client);

        const entry = await timeEntriesApi.getCurrent();

        if (!entry) {
          console.log('No time entry is currently running.');
          return;
        }

        if (options.format === 'table') {
          console.log(formatTimeEntryTable(entry));
        } else {
          console.log(formatJson(entry));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  timeEntry
    .command('get')
    .description('Get a time entry by ID')
    .argument('<id>', 'Time entry ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const timeEntriesApi = new TimeEntriesEndpoints(client);

        const entry = await timeEntriesApi.get(parseInt(id, 10));

        if (options.format === 'table') {
          console.log(formatTimeEntryTable(entry));
        } else {
          console.log(formatJson(entry));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  timeEntry
    .command('start')
    .description('Start a new time entry')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--description <text>', 'Time entry description')
    .option('--project <id>', 'Project ID')
    .option('--task <id>', 'Task ID')
    .option('--tags <tags>', 'Comma-separated list of tags')
    .option('--billable', 'Mark as billable')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const timeEntriesApi = new TimeEntriesEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const entry = await timeEntriesApi.start(workspaceId, {
          description: options.description,
          projectId: options.project ? parseInt(options.project, 10) : undefined,
          taskId: options.task ? parseInt(options.task, 10) : undefined,
          tags: options.tags?.split(',').map((t: string) => t.trim()),
          billable: options.billable,
        });

        if (options.format === 'table') {
          console.log(formatTimeEntryTable(entry));
        } else {
          console.log(formatJson(entry));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  timeEntry
    .command('stop')
    .description('Stop the currently running time entry')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const timeEntriesApi = new TimeEntriesEndpoints(client);

        const current = await timeEntriesApi.getCurrent();
        if (!current) {
          console.error('No time entry is currently running.');
          process.exit(1);
        }

        const workspaceId = await getWorkspaceId(client, options.workspace);
        const entry = await timeEntriesApi.stop(workspaceId, current.id);

        if (options.format === 'table') {
          console.log(formatTimeEntryTable(entry));
        } else {
          console.log(formatJson(entry));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  timeEntry
    .command('create')
    .description('Create a completed time entry')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .requiredOption('--start <datetime>', 'Start time (ISO 8601)')
    .requiredOption('--duration <seconds>', 'Duration in seconds')
    .option('--description <text>', 'Time entry description')
    .option('--project <id>', 'Project ID')
    .option('--task <id>', 'Task ID')
    .option('--tags <tags>', 'Comma-separated list of tags')
    .option('--billable', 'Mark as billable')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const timeEntriesApi = new TimeEntriesEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const entry = await timeEntriesApi.create(workspaceId, {
          workspace_id: workspaceId,
          start: new Date(options.start).toISOString(),
          duration: parseInt(options.duration, 10),
          description: options.description,
          project_id: options.project ? parseInt(options.project, 10) : undefined,
          task_id: options.task ? parseInt(options.task, 10) : undefined,
          tags: options.tags?.split(',').map((t: string) => t.trim()),
          billable: options.billable,
          created_with: 'toggl-cli',
        });

        if (options.format === 'table') {
          console.log(formatTimeEntryTable(entry));
        } else {
          console.log(formatJson(entry));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  timeEntry
    .command('update')
    .description('Update a time entry')
    .argument('<id>', 'Time entry ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--description <text>', 'Time entry description')
    .option('--project <id>', 'Project ID')
    .option('--task <id>', 'Task ID')
    .option('--tags <tags>', 'Comma-separated list of tags')
    .option('--billable', 'Mark as billable')
    .option('--no-billable', 'Mark as not billable')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const timeEntriesApi = new TimeEntriesEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const updateData: Record<string, unknown> = {};
        if (options.description !== undefined) updateData.description = options.description;
        if (options.project !== undefined) updateData.project_id = parseInt(options.project, 10);
        if (options.task !== undefined) updateData.task_id = parseInt(options.task, 10);
        if (options.tags !== undefined) updateData.tags = options.tags.split(',').map((t: string) => t.trim());
        if (options.billable !== undefined) updateData.billable = options.billable;

        const entry = await timeEntriesApi.update(workspaceId, parseInt(id, 10), updateData);

        if (options.format === 'table') {
          console.log(formatTimeEntryTable(entry));
        } else {
          console.log(formatJson(entry));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  timeEntry
    .command('delete')
    .description('Delete a time entry')
    .argument('<id>', 'Time entry ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const timeEntriesApi = new TimeEntriesEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        await timeEntriesApi.delete(workspaceId, parseInt(id, 10));
        console.log(`Time entry ${id} deleted successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  return timeEntry;
}
