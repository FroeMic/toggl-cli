import { Command } from 'commander';
import { TogglClient } from '../api/client';
import { TagsEndpoints } from '../api/endpoints/tags';
import { MeEndpoints } from '../api/endpoints/me';
import { formatJson, formatTagsTable, formatCsv } from '../formatters';
import { getDefaultWorkspaceId } from '../utils/config';

async function getWorkspaceId(client: TogglClient, workspaceOption?: string): Promise<number> {
  if (workspaceOption) return parseInt(workspaceOption, 10);
  const defaultWs = getDefaultWorkspaceId();
  if (defaultWs) return parseInt(defaultWs, 10);
  const meApi = new MeEndpoints(client);
  const user = await meApi.get();
  return user.default_workspace_id;
}

export function createTagCommand(): Command {
  const tag = new Command('tag').description('Manage tags');

  tag
    .command('list')
    .description('List tags')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table|csv)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tagsApi = new TagsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const tags = await tagsApi.list(workspaceId);

        if (options.format === 'table') {
          console.log(formatTagsTable(tags));
        } else if (options.format === 'csv') {
          console.log(formatCsv(tags));
        } else {
          console.log(formatJson(tags));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  tag
    .command('create')
    .description('Create a new tag')
    .requiredOption('--name <name>', 'Tag name')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tagsApi = new TagsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const newTag = await tagsApi.create(workspaceId, { name: options.name });

        if (options.format === 'table') {
          console.log(formatTagsTable([newTag]));
        } else {
          console.log(formatJson(newTag));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  tag
    .command('update')
    .description('Update a tag')
    .argument('<id>', 'Tag ID')
    .requiredOption('--name <name>', 'New tag name')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .option('--format <format>', 'Output format (json|table)', 'json')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tagsApi = new TagsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        const updatedTag = await tagsApi.update(workspaceId, parseInt(id, 10), { name: options.name });

        if (options.format === 'table') {
          console.log(formatTagsTable([updatedTag]));
        } else {
          console.log(formatJson(updatedTag));
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  tag
    .command('delete')
    .description('Delete a tag')
    .argument('<id>', 'Tag ID')
    .option('--api-token <token>', 'Toggl API token')
    .option('--workspace <id>', 'Workspace ID')
    .action(async (id: string, options) => {
      try {
        const client = new TogglClient(options.apiToken);
        const tagsApi = new TagsEndpoints(client);
        const workspaceId = await getWorkspaceId(client, options.workspace);

        await tagsApi.delete(workspaceId, parseInt(id, 10));
        console.log(`Tag ${id} deleted successfully.`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
    });

  return tag;
}
