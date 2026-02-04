# Toggl CLI

A fast, fully-typed TypeScript CLI for managing Toggl Track via the REST API.

## Features

- **Complete API Coverage** — Time entries, projects, clients, tags, tasks, workspaces, organizations, and groups
- **Multiple Output Formats** — JSON (default), table, and CSV for easy scripting and data export
- **Timer Control** — Start, stop, and manage time entries directly from your terminal
- **Flexible Authentication** — Environment variables, `.env` files, or command-line options
- **Type-Safe** — Built with TypeScript strict mode and Zod schema validation
- **Rate Limit Handling** — Automatic retry with exponential backoff

## Installation

### From npm

```bash
npm install -g toggl-cli
```

### From Source

```bash
git clone https://github.com/FroeMic/toggl-cli.git
cd toggl-cli
npm install
npm run build
npm link
```

## Quick Start

1. **Get your API token** from [Toggl Profile Settings](https://track.toggl.com/profile)

2. **Configure authentication** (choose one):

   ```bash
   # Option A: Environment variable
   export TOGGL_API_TOKEN=your_api_token_here

   # Option B: Create a .env file
   echo "TOGGL_API_TOKEN=your_api_token_here" > .env
   ```

3. **Verify setup**:

   ```bash
   toggl me get
   ```

4. **Start tracking**:

   ```bash
   toggl te start --description "Working on feature"
   ```

## Usage

### Global Options

All commands support these options:

| Option | Description |
|--------|-------------|
| `--api-token <token>` | Override `TOGGL_API_TOKEN` environment variable |
| `--workspace <id>` | Override `TOGGL_WORKSPACE_ID` environment variable |
| `--format <format>` | Output format: `json` (default), `table`, or `csv` |
| `--verbose` | Show detailed error messages |
| `--help` | Display help for command |
| `--version` | Display version |

### Time Entries

Manage time tracking with the `time-entry` command (alias: `te`).

```bash
# Start a timer
toggl te start --description "Working on feature" --project 12345

# See what's running
toggl te current

# Stop the timer
toggl te stop

# List recent entries (last 7 days)
toggl te list
toggl te list --format table

# List entries in date range
toggl te list --start-date 2024-01-01 --end-date 2024-01-31

# Create a completed entry
toggl te create --start "2024-01-15T09:00:00Z" --duration 3600 --description "Meeting"

# Update an entry
toggl te update <id> --description "Updated description"

# Delete an entry
toggl te delete <id>
```

### Projects

Manage projects with the `project` command (alias: `proj`).

```bash
# List all projects
toggl proj list
toggl proj list --active true --format table

# Get project details
toggl proj get <id>

# Create a project
toggl proj create --name "New Project" --color "#FF5733"

# Update a project
toggl proj update <id> --name "Renamed Project"

# Delete a project
toggl proj delete <id>
```

### Clients

Manage clients with the `client` command.

```bash
# List clients
toggl client list
toggl client list --status archived

# Create a client
toggl client create --name "Acme Corp" --notes "Important client"

# Archive/restore a client
toggl client archive <id>
toggl client restore <id>

# Delete a client
toggl client delete <id>
```

### Tags

Manage tags with the `tag` command.

```bash
# List tags
toggl tag list

# Create a tag
toggl tag create --name "urgent"

# Update a tag
toggl tag update <id> --name "high-priority"

# Delete a tag
toggl tag delete <id>
```

### Tasks

Manage project tasks with the `task` command.

```bash
# List tasks for a project
toggl task list --project <project_id>

# Create a task
toggl task create --name "Implement feature" --project <project_id>

# Update a task
toggl task update <id> --project <project_id> --name "Updated task"

# Delete a task
toggl task delete <id> --project <project_id>
```

### Workspaces

Manage workspaces with the `workspace` command (alias: `ws`).

```bash
# List workspaces
toggl ws list

# Get workspace details
toggl ws get <id>

# List workspace users
toggl ws users list --workspace <id>
```

### Organizations

Manage organizations with the `organization` command (alias: `org`).

```bash
# Get organization details
toggl org get <id>

# List organization users
toggl org users list --organization <id>
```

### Groups

Manage groups with the `group` command.

```bash
# List groups
toggl group list --organization <id>

# Create a group
toggl group create --organization <id> --name "Development Team"

# Update a group
toggl group update <id> --organization <org_id> --name "Engineering Team"

# Delete a group
toggl group delete <id> --organization <org_id>
```

### User Profile

Access your profile with the `me` command.

```bash
# Get your profile
toggl me get
toggl me get --with-related-data

# Get preferences
toggl me preferences

# Get API quota info
toggl me quota
```

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `TOGGL_API_TOKEN` | Your Toggl API token (required) |
| `TOGGL_WORKSPACE_ID` | Default workspace ID (optional) |
| `DEBUG_API_ERRORS` | Set to `true` for detailed error messages |

### Configuration File

Create a `.env` file in your project directory:

```bash
TOGGL_API_TOKEN=your_api_token_here
TOGGL_WORKSPACE_ID=your_workspace_id
DEBUG_API_ERRORS=false
```

### Option Precedence

Options are resolved in this order (highest to lowest priority):

1. Command-line flags (`--api-token`, `--workspace`)
2. Environment variables
3. `.env` file values

## Output Formats

### JSON (Default)

```bash
toggl te list --format json
```

Returns structured JSON, ideal for piping to `jq` or other tools.

### Table

```bash
toggl te list --format table
```

Human-readable table format for terminal viewing.

### CSV

```bash
toggl te list --format csv > time-entries.csv
```

CSV output for spreadsheets and data analysis.

## Development

### Setup

```bash
git clone https://github.com/FroeMic/toggl-cli.git
cd toggl-cli
npm install
```

### Build

```bash
npm run build
```

### Run in Development

```bash
npm run dev -- te list
npm run dev -- --help
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Testing

### Unit Tests

```bash
npm test
```

Runs 74 unit tests covering API client, schemas, formatters, and utilities.

### Integration Tests

```bash
# Requires TOGGL_API_TOKEN in environment or .env file
npm run test:integration
```

Runs 11 integration tests against the live Toggl API, covering:
- User profile retrieval
- Project CRUD operations
- Time entry workflows (create, start, stop, delete)

### All Tests

```bash
npm test && npm run test:integration
```

## API Reference

This CLI interacts with the [Toggl Track API v9](https://engineering.toggl.com/docs/).

### Rate Limits

| Limit Type | Value |
|------------|-------|
| Quota | 30-600 requests/hour (subscription dependent) |
| Rate | ~1 request/second (leaky bucket) |

The CLI automatically handles rate limiting with retry logic and exponential backoff.

### Authentication

The Toggl API uses HTTP Basic Authentication with your API token:

```
Authorization: Basic base64(api_token:api_token)
```

## Project Structure

```
toggl-cli/
├── src/
│   ├── cli.ts                 # Entry point
│   ├── api/
│   │   ├── client.ts          # HTTP client
│   │   ├── errors.ts          # Error classes
│   │   ├── schemas.ts         # Zod validation
│   │   ├── types.ts           # TypeScript types
│   │   └── endpoints/         # API endpoints
│   ├── commands/              # CLI commands
│   ├── formatters/            # Output formatters
│   └── utils/                 # Utilities
├── tests/
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
└── docs/                      # Documentation
```

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
