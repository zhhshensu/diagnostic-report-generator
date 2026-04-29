# Diagnostic Report Generator

Generate professional, self-contained diagnostic report HTML pages with interactive charts, metrics tables, health status visualization, and optimization recommendations.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Packages

| Package | Description |
|---------|-------------|
| [Frontend](./packages/frontend) | React SPA (Vite + TypeScript + TailwindCSS + shadcn/ui) |
| [MCP Server](./packages/mcp-server) | MCP server for AI client integration |
| [Diagnostic Report Skill](./diagnostic-report) | Original Claude Skill (SKILL.md + template.html) |

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 9

### Install & Run

```bash
pnpm install
pnpm dev     # Start frontend at http://localhost:5173
```

### Build

```bash
pnpm build
```

## Frontend Features

- **Dashboard** - Overview with stats, recent reports, quick actions
- **Provider Management** - Configure LLM providers (OpenAI, Anthropic, Gemini, Azure, Ollama, Custom)
- **Report Generation** - Interactive editor with live streaming preview
- **Report History** - Search, filter, sort, and manage reports
- **Report Detail** - Full preview, copy HTML, download, share, PDF export
- **Shared Reports** - Public shareable report links

### Route Map

| Route | Page |
|-------|------|
| `/` | Dashboard |
| `/providers` | LLM Provider configuration |
| `/reports/new` | Report generation editor |
| `/reports/:id` | Report detail & preview |
| `/reports` | Report history list |
| `/shared/:shareId` | Shared report (public) |

## MCP Server Usage

The MCP server allows AI clients (Claude Desktop, Cursor, etc.) to generate diagnostic reports programmatically.

```bash
pnpm -F @diagnostic-report/mcp-server build
node packages/mcp-server/dist/index.js
```

See [MCP Usage Guide](./docs/mcp-usage.md) for detailed configuration.

### MCP Tool: `diagnostic-report-generator`

Input: `{ userInput, provider: { type, apiKey, baseUrl, model } }`
Output: Complete standalone HTML diagnostic report

## Claude Skill

The original Claude Skill is in the `diagnostic-report/` directory. See [SKILL.md](./diagnostic-report/SKILL.md) for details.

To install as a Claude Skill:
```bash
cd diagnostic-report-generator
zip -r diagnostic-report.zip diagnostic-report/
```
Upload to Claude.ai → Settings → Capabilities → Skills

## Project Structure

```
diagnostic-report-generator/
├── packages/
│   ├── frontend/              # React SPA (Vite + shadcn/ui)
│   │   ├── src/
│   │   │   ├── components/    # UI components
│   │   │   ├── pages/         # Route pages
│   │   │   ├── stores/        # Zustand state stores
│   │   │   └── lib/           # Utilities & LLM client
│   │   └── ...
│   └── mcp-server/            # MCP server
│       ├── src/
│       │   └── index.ts       # Server entry
│       └── ...
├── diagnostic-report/         # Original Claude Skill
├── docs/
│   └── mcp-usage.md           # MCP documentation
├── examples/                  # Generated report examples
├── package.json               # pnpm workspace root
├── pnpm-workspace.yaml
└── README.md
```

## License

[MIT](LICENSE)
