#!/usr/bin/env node

import { Command } from 'commander';
import {
  createMeCommand,
  createTimeEntryCommand,
  createWorkspaceCommand,
  createProjectCommand,
  createClientCommand,
  createTagCommand,
  createTaskCommand,
  createOrganizationCommand,
  createGroupCommand,
} from './commands';

const program = new Command();

program
  .name('toggl')
  .description('Fully-typed TypeScript CLI for managing Toggl Track via REST API')
  .version('0.1.0');

// Global options
program.option('--api-token <token>', 'Toggl API token (overrides TOGGL_API_TOKEN env var)');
program.option('--workspace <id>', 'Default workspace ID (overrides TOGGL_WORKSPACE_ID env var)');
program.option('--verbose', 'Show detailed error messages');

// Add commands
program.addCommand(createMeCommand());
program.addCommand(createTimeEntryCommand());
program.addCommand(createWorkspaceCommand());
program.addCommand(createProjectCommand());
program.addCommand(createClientCommand());
program.addCommand(createTagCommand());
program.addCommand(createTaskCommand());
program.addCommand(createOrganizationCommand());
program.addCommand(createGroupCommand());

program.parse();
