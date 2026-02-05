import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { MeEndpoints } from '../api/endpoints/me';
import { formatJson, formatUserTable, formatGenericTable } from '../formatters';

export function createMeCommand(): Command {
  const me = new Command('me').description('Manage your user profile');

  me.command('get')
    .description('Get your user profile')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--with-related-data', 'Include related data (workspaces, etc.)')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const meApi = new MeEndpoints(client);

        const user = await meApi.get(options.withRelatedData);

        if (options.format === 'table') {
          console.log(formatUserTable(user));
        } else {
          console.log(formatJson(user));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  me.command('update')
    .description('Update your user profile')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .option('--data <json>', 'JSON data to update')
    .action(async (options) => {
      try {
        if (!options.data) {
          console.error('Error: --data option is required');
          process.exit(1);
        }

        const data = JSON.parse(options.data) as Record<string, unknown>;
        const client = new TogglClient(options.apiToken);
        const meApi = new MeEndpoints(client);

        const user = await meApi.update(data);

        if (options.format === 'table') {
          console.log(formatUserTable(user));
        } else {
          console.log(formatJson(user));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  me.command('preferences')
    .description('Get your user preferences')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const meApi = new MeEndpoints(client);

        const preferences = await meApi.getPreferences();

        if (options.format === 'table') {
          const data = Object.entries(preferences).map(([key, value]) => ({
            Setting: key,
            Value: String(value),
          }));
          console.log(formatGenericTable(data));
        } else {
          console.log(formatJson(preferences));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  me.command('quota')
    .description('Get API quota information')
    .option('--api-token <token>', 'Toggl API token')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const meApi = new MeEndpoints(client);

        const quotas = await meApi.getQuota();

        if (options.format === 'table') {
          const data = quotas.map((q) => ({
            'Organization ID': q.organization_id ?? '-',
            Remaining: q.remaining,
            Total: q.total,
            'Resets In': `${Math.floor(q.resets_in_secs / 60)} min`,
          }));
          console.log(formatGenericTable(data));
        } else {
          console.log(formatJson(quotas));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  return me;
}
