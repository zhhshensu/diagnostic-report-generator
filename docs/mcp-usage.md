# MCP Server Usage Guide

## Installation

```bash
# Build the MCP server
cd diagnostic-report-generator
pnpm install
pnpm -F @diagnostic-report/mcp-server build

# Run with stdio transport (default)
node packages/mcp-server/dist/index.js
```

## MCP Client Configuration

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "diagnostic-report": {
      "command": "node",
      "args": ["/path/to/diagnostic-report-generator/packages/mcp-server/dist/index.js"],
      "transport": "stdio"
    }
  }
}
```

### Cursor

Configure in Cursor settings → MCP Servers:

```
Name: diagnostic-report
Type: stdio
Command: node /path/to/diagnostic-report-generator/packages/mcp-server/dist/index.js
```

## Tool: `diagnostic-report-generator`

Generate a standalone HTML diagnostic report with interactive charts, metrics tables, health status visualization, and optimization recommendations.

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userInput` | string | Yes | Natural language description of the diagnostic report |
| `provider.type` | string | Yes | Provider type: `openai`, `anthropic`, `gemini`, `azure`, `ollama`, or `custom` |
| `provider.apiKey` | string | No | API key for the provider |
| `provider.baseUrl` | string | Yes | Base URL for the provider API |
| `provider.model` | string | Yes | Model name to use |

### Example Usage

```json
{
  "userInput": "Generate a system health check report for a production server cluster with CPU, memory, disk, and network metrics",
  "provider": {
    "type": "openai",
    "apiKey": "sk-...",
    "baseUrl": "https://api.openai.com/v1",
    "model": "gpt-4o"
  }
}
```

### Output

A complete standalone HTML document containing:
1. Report header with title, ID, timestamp
2. Metrics data table with health status badges
3. Data visualization (Chart.js charts)
4. Health status labels
5. Diagnosis summary with score and risk level
6. Optimization suggestions with priority indicators

## Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node packages/mcp-server/dist/index.js
```

## Architecture

```
Client (Claude Desktop/Cursor)
        │
        │  stdin/stdout (stdio)
        ▼
MCP Server (diagnostic-report-generator)
        │
        │  HTTP POST /chat/completions
        ▼
LLM Provider (OpenAI/Anthropic/Gemini/Ollama/...)
```
