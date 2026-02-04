import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { ClientsEndpoints } from '../api/endpoints/clients';
import { MeEndpoints } from '../api/endpoints/me';
import { formatJson, formatClientsTable, formatClientTable, formatCsv } from '../formatters';
import { getDefaultWorkspaceId } from '../utils/config';

async function getWorkspaceId(client: TogglClient, workspaceOption?: string): Promise<number> {
  if (workspaceOption) return parseInt(workspaceOption, 10);
  const defaultWs = getDefaultWorkspaceId();
  if (defaultWs) return parseInt(defaultWs, 10);
  const meApi = new MeEndpoints(client);
  const user = await meApi.get();
  return user.default_workspace_id;
}

export function createClientCommand(): Command {
  const clientCmd = new Command('client').description('Manage clients');

  clientCmd
    .command('list')
    .description('List clients')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .option('--status <status>', 'Filter by status (active|archived|both)')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const clientsApi = new ClientsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const clients = await clientsApi.list(workspaceId, { status: options.status });

        if (options.format === 'table') {
          console.log(formatClientsTable(clients));
        } else if (options.format === 'csv') {
          console.log(formatCsv(clients));
        } else {
          console.log(formatJson(clients));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  clientCmd
    .command('get')
    .description('Get a client by ID')
    .argument('<id>', 'Client ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const clientsApi = new ClientsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const cl = await clientsApi.get(workspaceId, parseInt(id, 10));

        if (options.format === 'table') {
          console.log(formatClientTable(cl));
        } else {
          console.log(formatJson(cl));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  clientCmd
    .command('create')
    .description('Create a new client')
    .requiredOption('--name <name>', 'Client name')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--notes <notes>', 'Client notes')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const clientsApi = new ClientsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const cl = await clientsApi.create(workspaceId, {
          name: options.name,
          notes: options.notes,
        });

        if (options.format === 'table') {
          console.log(formatClientTable(cl));
        } else {
          console.log(formatJson(cl));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  clientCmd
    .command('update')
    .description('Update a client')
    .argument('<id>', 'Client ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--name <name>', 'Client name')
    .option('--notes <notes>', 'Client notes')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const clientsApi = new ClientsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const updateData: Record<string, unknown> = {};
        if (options.name !== undefined) updateData.name = options.name;
        if (options.notes !== undefined) updateData.notes = options.notes;

        const cl = await clientsApi.update(workspaceId, parseInt(id, 10), updateData);

        if (options.format === 'table') {
          console.log(formatClientTable(cl));
        } else {
          console.log(formatJson(cl));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  clientCmd
    .command('archive')
    .description('Archive a client')
    .argument('<id>', 'Client ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const clientsApi = new ClientsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const cl = await clientsApi.archive(workspaceId, parseInt(id, 10));

        if (options.format === 'table') {
          console.log(formatClientTable(cl));
        } else {
          console.log(formatJson(cl));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  clientCmd
    .command('restore')
    .description('Restore an archived client')
    .argument('<id>', 'Client ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const clientsApi = new ClientsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const cl = await clientsApi.restore(workspaceId, parseInt(id, 10));

        if (options.format === 'table') {
          console.log(formatClientTable(cl));
        } else {
          console.log(formatJson(cl));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  clientCmd
    .command('delete')
    .description('Delete a client')
    .argument('<id>', 'Client ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const clientsApi = new ClientsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        await clientsApi.delete(workspaceId, parseInt(id, 10));
        console.log(`Client ${id} deleted successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  return clientCmd;
}
