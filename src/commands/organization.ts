import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { OrganizationsEndpoints } from '../api/endpoints/organizations';
import { formatJson, formatOrganizationTable, formatOrganizationUsersTable, formatCsv } from '../formatters';

export function createOrganizationCommand(): Command {
  const org = new Command('organization').description('Manage organizations').alias('org');

  org
    .command('get')
    .description('Get an organization by ID')
    .argument('<id>', 'Organization ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const orgsApi = new OrganizationsEndpoints(client);

        const organization = await orgsApi.get(parseInt(id, 10));

        if (options.format === 'table') {
          console.log(formatOrganizationTable(organization));
        } else {
          console.log(formatJson(organization));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  org
    .command('update')
    .description('Update an organization')
    .argument('<id>', 'Organization ID')
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
        const orgsApi = new OrganizationsEndpoints(client);

        const organization = await orgsApi.update(parseInt(id, 10), data);

        if (options.format === 'table') {
          console.log(formatOrganizationTable(organization));
        } else {
          console.log(formatJson(organization));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  const users = new Command('users').description('Manage organization users');

  users
    .command('list')
    .description('List organization users')
    .requiredOption('--organization <id>', 'Organization ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const orgsApi = new OrganizationsEndpoints(client);

        const orgUsers = await orgsApi.listUsers(parseInt(options.organization, 10));

        if (options.format === 'table') {
          console.log(formatOrganizationUsersTable(orgUsers));
        } else if (options.format === 'csv') {
          console.log(formatCsv(orgUsers));
        } else {
          console.log(formatJson(orgUsers));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  org.addCommand(users);

  return org;
}
