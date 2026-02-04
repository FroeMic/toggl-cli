import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { GroupsEndpoints } from '../api/endpoints/groups';
import { formatJson, formatGroupsTable, formatGroupTable, formatCsv } from '../formatters';

export function createGroupCommand(): Command {
  const group = new Command('group').description('Manage groups');

  group
    .command('list')
    .description('List groups in an organization')
    .requiredOption('--organization <id>', 'Organization ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const groupsApi = new GroupsEndpoints(client);

        const groups = await groupsApi.list(parseInt(options.organization, 10));

        if (options.format === 'table') {
          console.log(formatGroupsTable(groups));
        } else if (options.format === 'csv') {
          console.log(formatCsv(groups));
        } else {
          console.log(formatJson(groups));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  group
    .command('create')
    .description('Create a new group')
    .requiredOption('--organization <id>', 'Organization ID')
    .requiredOption('--name <name>', 'Group name')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const groupsApi = new GroupsEndpoints(client);

        const newGroup = await groupsApi.create(parseInt(options.organization, 10), {
          name: options.name,
        });

        if (options.format === 'table') {
          console.log(formatGroupTable(newGroup));
        } else {
          console.log(formatJson(newGroup));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  group
    .command('update')
    .description('Update a group')
    .argument('<id>', 'Group ID')
    .requiredOption('--organization <id>', 'Organization ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--name <name>', 'Group name')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const groupsApi = new GroupsEndpoints(client);

        const updateData: Record<string, unknown> = {};
        if (options.name !== undefined) updateData.name = options.name;

        const updatedGroup = await groupsApi.update(
          parseInt(options.organization, 10),
          parseInt(id, 10),
          updateData
        );

        if (options.format === 'table') {
          console.log(formatGroupTable(updatedGroup));
        } else {
          console.log(formatJson(updatedGroup));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  group
    .command('delete')
    .description('Delete a group')
    .argument('<id>', 'Group ID')
    .requiredOption('--organization <id>', 'Organization ID')
    .option('--api-token <token>', 'Toggl API token')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const groupsApi = new GroupsEndpoints(client);

        await groupsApi.delete(parseInt(options.organization, 10), parseInt(id, 10));
        console.log(`Group ${id} deleted successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  return group;
}
