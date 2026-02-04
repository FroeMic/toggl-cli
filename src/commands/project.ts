import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { ProjectsEndpoints } from '../api/endpoints/projects';
import { MeEndpoints } from '../api/endpoints/me';
import { formatJson, formatProjectsTable, formatProjectTable, formatCsv } from '../formatters';
import { getDefaultWorkspaceId } from '../utils/config';

async function getWorkspaceId(client: TogglClient, workspaceOption?: string): Promise<number> {
  if (workspaceOption) return parseInt(workspaceOption, 10);
  const defaultWs = getDefaultWorkspaceId();
  if (defaultWs) return parseInt(defaultWs, 10);
  const meApi = new MeEndpoints(client);
  const user = await meApi.get();
  return user.default_workspace_id;
}

export function createProjectCommand(): Command {
  const project = new Command('project').description('Manage projects').alias('proj');

  project
    .command('list')
    .description('List projects')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .option('--active <boolean>', 'Filter by active status')
    .option('--client-id <id>', 'Filter by client ID')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const projectsApi = new ProjectsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const projects = await projectsApi.list(workspaceId, {
          active: options.active !== undefined ? options.active === 'true' : undefined,
          clientIds: options.clientId ? [parseInt(options.clientId, 10)] : undefined,
        });

        if (options.format === 'table') {
          console.log(formatProjectsTable(projects));
        } else if (options.format === 'csv') {
          console.log(formatCsv(projects));
        } else {
          console.log(formatJson(projects));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  project
    .command('get')
    .description('Get a project by ID')
    .argument('<id>', 'Project ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const projectsApi = new ProjectsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const proj = await projectsApi.get(workspaceId, parseInt(id, 10));

        if (options.format === 'table') {
          console.log(formatProjectTable(proj));
        } else {
          console.log(formatJson(proj));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  project
    .command('create')
    .description('Create a new project')
    .requiredOption('--name <name>', 'Project name')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--client-id <id>', 'Client ID')
    .option('--color <color>', 'Project color (hex code)')
    .option('--private', 'Make project private')
    .option('--billable', 'Make project billable')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const projectsApi = new ProjectsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const proj = await projectsApi.create(workspaceId, {
          name: options.name,
          client_id: options.clientId ? parseInt(options.clientId, 10) : undefined,
          color: options.color,
          is_private: options.private,
          billable: options.billable,
        });

        if (options.format === 'table') {
          console.log(formatProjectTable(proj));
        } else {
          console.log(formatJson(proj));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  project
    .command('update')
    .description('Update a project')
    .argument('<id>', 'Project ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--name <name>', 'Project name')
    .option('--client-id <id>', 'Client ID')
    .option('--color <color>', 'Project color')
    .option('--active <boolean>', 'Active status')
    .option('--billable <boolean>', 'Billable status')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const projectsApi = new ProjectsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const updateData: Record<string, unknown> = {};
        if (options.name !== undefined) updateData.name = options.name;
        if (options.clientId !== undefined) updateData.client_id = parseInt(options.clientId, 10);
        if (options.color !== undefined) updateData.color = options.color;
        if (options.active !== undefined) updateData.active = options.active === 'true';
        if (options.billable !== undefined) updateData.billable = options.billable === 'true';

        const proj = await projectsApi.update(workspaceId, parseInt(id, 10), updateData);

        if (options.format === 'table') {
          console.log(formatProjectTable(proj));
        } else {
          console.log(formatJson(proj));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  project
    .command('delete')
    .description('Delete a project')
    .argument('<id>', 'Project ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const projectsApi = new ProjectsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        await projectsApi.delete(workspaceId, parseInt(id, 10));
        console.log(`Project ${id} deleted successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  return project;
}
