# yamory MCP Server (Unofficial)

[![npm version](https://img.shields.io/npm/v/@aranseshita/yamory-mcp-server?cacheSeconds=300)](https://www.npmjs.com/package/@aranseshita/yamory-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/AranSeshita/yamory-mcp-server/blob/main/LICENSE)
[![CI](https://github.com/AranSeshita/yamory-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/AranSeshita/yamory-mcp-server/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/AranSeshita/ac9dcd5a7dfbbbc969bbeae87134aa45/raw/coverage.json)](https://github.com/AranSeshita/yamory-mcp-server/actions/workflows/ci.yml)

> **Note**: This is an unofficial community-driven project and is not affiliated with or endorsed by [yamory](https://yamory.io/) or Assured, Inc.

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for [yamory](https://yamory.io/) vulnerability management cloud. Connects AI agents to yamory as a knowledge base — providing **what's detected, how dangerous it is, and how to fix it**.

---

## Quick Setup

### 1. Get Your API Token

1. Log in to [yamory](https://yamory.io/)
2. Navigate to **Team Settings** > **API Tokens**
3. Click **Issue Token** with the usage scope set to **API Server**
4. Set the token as an environment variable:

```bash
export YAMORY_API_TOKEN="your-token-here"
```

> **Tip**: Add this to your shell profile (`~/.zshrc`, `~/.bashrc`, etc.) so it persists across sessions.

### 2. Add to Your MCP Client

**Claude Code**

```bash
claude mcp add yamory \
  --env YAMORY_API_TOKEN=$YAMORY_API_TOKEN \
  -- npx @aranseshita/yamory-mcp-server@latest
```

**Claude Desktop** — Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "yamory": {
      "command": "npx",
      "args": ["@aranseshita/yamory-mcp-server@latest"],
      "env": {
        "YAMORY_API_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

<details>
<summary><strong>Cursor / VS Code / Docker</strong></summary>

**Cursor** — Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "yamory": {
      "command": "npx",
      "args": ["@aranseshita/yamory-mcp-server@latest"],
      "env": { "YAMORY_API_TOKEN": "<YOUR_TOKEN>" }
    }
  }
}
```

**VS Code (GitHub Copilot)** — Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "yamory": {
      "command": "npx",
      "args": ["@aranseshita/yamory-mcp-server@latest"],
      "env": { "YAMORY_API_TOKEN": "<YOUR_TOKEN>" }
    }
  }
}
```

**Docker** — Replace `npx` command with:

```json
{
  "mcpServers": {
    "yamory": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "YAMORY_API_TOKEN", "ghcr.io/aranseshita/yamory-mcp-server"],
      "env": { "YAMORY_API_TOKEN": "<YOUR_TOKEN>" }
    }
  }
}
```
</details>

**Team sharing (Claude Code)** — Add `.mcp.json` to your project root. Each member sets `YAMORY_API_TOKEN` in their own environment:

```json
{
  "mcpServers": {
    "yamory": {
      "command": "npx",
      "args": ["@aranseshita/yamory-mcp-server@latest"],
      "env": { "YAMORY_API_TOKEN": "${YAMORY_API_TOKEN}" }
    }
  }
}
```

---

## What Can I Ask?

### Vulnerability Check & Remediation

Ask about your team's current vulnerabilities and get actionable remediation guidance. Combine with coding agents for automated fixes.

```
"Show me all open vulnerabilities"
"What immediate-priority issues do we have?"
"How do I fix the log4j vulnerability?"
"Update the affected packages and create a PR"
```

### CVE Impact Analysis

When a new CVE is disclosed, instantly check if your projects are affected.

```
"Is CVE-2024-XXXXX affecting any of our projects?"
"List all projects using the vulnerable package"
"Summarize the impact and remediation steps"
```

### Reporting & Triage

Generate summaries for standups, audits, or security reviews.

```
"Summarize this month's vulnerability status"
"Any projects with unresolved immediate-priority issues?"
"Show RCE vulnerabilities that are in the CISA KEV catalog"
"How many new vulnerabilities were detected this month?"
```

---

## Tools

This server provides three tools. MCP clients automatically discover all parameters — the key filters are listed below.

### `search_app_vulns`

Search app library (npm, Maven, pip, etc.) vulnerabilities.

### `search_container_vulns`

Search container image vulnerabilities.

### `search_host_vulns`

Search host (OS-level) vulnerabilities.

**Common filters** (all tools):

| Filter | Example | Description |
|--------|---------|-------------|
| `keyword` | `log4j`, `CVE-2024-1234` | Match project name, package name, or CVE-ID |
| `triageLevel` | `immediate,delayed` | Triage priority |
| `status` | `open` | Vulnerability status |
| `vulnType` | `RCE`, `XSS`, `SQLI` | Vulnerability category |
| `cvssScore` | `9.0` | Minimum CVSS score |
| `includeKev` | `true` | CISA Known Exploited Vulnerabilities only |
| `includePoc` | `true` | Only vulnerabilities with public PoC |
| `openTimestamp` | `2024-01-01` | Detected after this date |

> You don't need to remember these — just describe what you're looking for in natural language, and the AI agent will select the right filters.

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `YAMORY_API_TOKEN` | Yes | API token from yamory team settings |
| `YAMORY_TEAM_NAME` | No | Filter by team name. Set `*` for organization-wide access (security team tokens only) |

### Scope Filter

yamory API tokens are scoped per team. `YAMORY_TEAM_NAME` adds an optional additional filter:

| Scenario | Token | `YAMORY_TEAM_NAME` | Result |
|----------|-------|--------------------|--------|
| Developer | Team token | _(unset)_ | Own team's data only |
| Security lead, one team | Security token | `Dev Team` | Filtered to specified team |
| Security lead, org-wide | Security token | `*` | All teams visible |

### Security

- **Never commit tokens** to version control
- **Use environment variables** or `.mcp.json` with `${YAMORY_API_TOKEN}` syntax
- **Restrict scope** with `YAMORY_TEAM_NAME` when possible
- **Rotate tokens** periodically from yamory team settings

---

## Development

```bash
npm install
npm run build
npm test
```

Debug with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## Roadmap

### v1 (Current)
- [x] App library vulnerability search
- [x] Container image vulnerability search
- [x] Host vulnerability search
- [x] Scope filter (token / team / organization-wide)
- [x] npm + Docker distribution

### v2
- [ ] CVE detail tool
- [ ] CSPM vulnerability endpoints
- [ ] Software & container image listing

---

## References

- [yamory](https://yamory.io/) — Vulnerability management cloud
- [yamory API Documentation](https://docs.yamory.io/2da5d37036fb48a6a05ea76908ddc713)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

This project is an unofficial, community-driven integration. It is not affiliated with, endorsed by, or supported by yamory or Assured, Inc. "yamory" is a trademark of Assured, Inc. Use of the yamory API is subject to yamory's terms of service.
