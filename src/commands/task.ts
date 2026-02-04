import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { TasksEndpoints } from '../api/endpoints/tasks';
import { MeEndpoints } from '../api/endpoints/me';
import { formatJson, formatTasksTable, formatTaskTable, formatCsv } from '../formatters';
import { getDefaultWorkspaceId } from '../utils/config';

async function getWorkspaceId(client: TogglClient, workspaceOption?: string): Promise<number> {
  if (workspaceOption) return parseInt(workspaceOption, 10);
  const defaultWs = getDefaultWorkspaceId();
  if (defaultWs) return parseInt(defaultWs, 10);
  const meApi = new MeEndpoints(client);
  const user = await meApi.get();
  return user.default_workspace_id;
}

export function createTaskCommand(): Command {
  const task = new Command('task').description('Manage tasks');

  task
    .command('list')
    .description('List tasks for a project')
    .requiredOption('--project <id>', 'Project ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .option('--active <boolean>', 'Filter by active status')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tasksApi = new TasksEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const tasks = await tasksApi.list(workspaceId, parseInt(options.project, 10), {
          active: options.active !== undefined ? options.active === 'true' : undefined,
        });

        if (options.format === 'table') {
          console.log(formatTasksTable(tasks));
        } else if (options.format === 'csv') {
          console.log(formatCsv(tasks));
        } else {
          console.log(formatJson(tasks));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  task
    .command('get')
    .description('Get a task by ID')
    .argument('<id>', 'Task ID')
    .requiredOption('--project <id>', 'Project ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tasksApi = new TasksEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const t = await tasksApi.get(workspaceId, parseInt(options.project, 10), parseInt(id, 10));

        if (options.format === 'table') {
          console.log(formatTaskTable(t));
        } else {
          console.log(formatJson(t));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  task
    .command('create')
    .description('Create a new task')
    .requiredOption('--name <name>', 'Task name')
    .requiredOption('--project <id>', 'Project ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--estimated-seconds <seconds>', 'Estimated time in seconds')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tasksApi = new TasksEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const t = await tasksApi.create(workspaceId, parseInt(options.project, 10), {
          name: options.name,
          estimated_seconds: options.estimatedSeconds ? parseInt(options.estimatedSeconds, 10) : undefined,
        });

        if (options.format === 'table') {
          console.log(formatTaskTable(t));
        } else {
          console.log(formatJson(t));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  task
    .command('update')
    .description('Update a task')
    .argument('<id>', 'Task ID')
    .requiredOption('--project <id>', 'Project ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--name <name>', 'Task name')
    .option('--active <boolean>', 'Active status')
    .option('--estimated-seconds <seconds>', 'Estimated time in seconds')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tasksApi = new TasksEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const updateData: Record<string, unknown> = {};
        if (options.name !== undefined) updateData.name = options.name;
        if (options.active !== undefined) updateData.active = options.active === 'true';
        if (options.estimatedSeconds !== undefined) updateData.estimated_seconds = parseInt(options.estimatedSeconds, 10);

        const t = await tasksApi.update(workspaceId, parseInt(options.project, 10), parseInt(id, 10), updateData);

        if (options.format === 'table') {
          console.log(formatTaskTable(t));
        } else {
          console.log(formatJson(t));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  task
    .command('delete')
    .description('Delete a task')
    .argument('<id>', 'Task ID')
    .requiredOption('--project <id>', 'Project ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tasksApi = new TasksEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        await tasksApi.delete(workspaceId, parseInt(options.project, 10), parseInt(id, 10));
        console.log(`Task ${id} deleted successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  return task;
}
