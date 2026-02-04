import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { WorkspacesEndpoints } from '../api/endpoints/workspaces';
import {
  formatJson,
  formatWorkspacesTable,
  formatWorkspaceUsersTable,
  formatGenericTable,
  formatCsv,
} from '../formatters';

export function createWorkspaceCommand(): Command {
  const workspace = new Command('workspace')
    .description('Manage workspaces')
    .alias('ws');

  workspace
    .command('list')
    .description('List all workspaces')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const workspacesApi = new WorkspacesEndpoints(client);

        const workspaces = await workspacesApi.list();

        if (options.format === 'table') {
          console.log(formatWorkspacesTable(workspaces));
        } else if (options.format === 'csv') {
          console.log(formatCsv(workspaces));
        } else {
          console.log(formatJson(workspaces));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  workspace
    .command('get')
    .description('Get a workspace by ID')
    .argument('<id>', 'Workspace ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const workspacesApi = new WorkspacesEndpoints(client);

        const ws = await workspacesApi.get(parseInt(id, 10));

        if (options.format === 'table') {
          const data = Object.entries(ws).map(([key, value]) => ({
            Field: key,
            Value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
          }));
          console.log(formatGenericTable(data));
        } else {
          console.log(formatJson(ws));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  workspace
    .command('update')
    .description('Update a workspace')
    .argument('<id>', 'Workspace ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--data <json>', 'JSON data to update')
    .action(async (id: string, options) => {
      try {
        if (!options.data) {
          console.error('Error: --data option is required');
          process.exit(1);
        }

        const data = JSON.parse(options.data) as Record<string, unknown>;
        const client = new TogglClient(options.apiToken);
        const workspacesApi = new WorkspacesEndpoints(client);

        const ws = await workspacesApi.update(parseInt(id, 10), data);

        if (options.format === 'table') {
          const tableData = Object.entries(ws).map(([key, value]) => ({
            Field: key,
            Value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
          }));
          console.log(formatGenericTable(tableData));
        } else {
          console.log(formatJson(ws));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  const users = new Command('users').description('Manage workspace users');

  users
    .command('list')
    .description('List workspace users')
    .requiredOption('--workspace <id>', 'Workspace ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const workspacesApi = new WorkspacesEndpoints(client);

        const wsUsers = await workspacesApi.listUsers(parseInt(options.workspace, 10));

        if (options.format === 'table') {
          console.log(formatWorkspaceUsersTable(wsUsers));
        } else if (options.format === 'csv') {
          console.log(formatCsv(wsUsers));
        } else {
          console.log(formatJson(wsUsers));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  workspace.addCommand(users);

  return workspace;
}
