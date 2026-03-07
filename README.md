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

This server provides five tools. MCP clients automatically discover all parameters — the key filters are listed below.

### `search_vulns` (recommended default)

Search app library and container image vulnerabilities in a single call. Results are grouped by source type (`app` / `container`).

### `search_app_vulns`

Search app library (npm, Maven, pip, etc.) vulnerabilities.

### `search_container_vulns`

Search container image vulnerabilities.

### `search_host_vulns`

Search host (OS-level) vulnerabilities.

### `search_asset_vulns`

Search IT asset (network devices, appliances, etc.) vulnerabilities.

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
- [x] IT asset vulnerability search
- [x] Scope filter (token / team / organization-wide)
- [x] npm + Docker distribution

### v2
- [ ] CVE detail tool
- [ ] CSPM vulnerability endpoints

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

---

<details>
<summary><strong>日本語 / Japanese</strong></summary>

# yamory MCP Server（非公式）

> **注意**: 本プロジェクトは非公式のコミュニティ主導プロジェクトであり、[yamory](https://yamory.io/) および Assured 株式会社とは一切関係ありません。

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) を利用した [yamory](https://yamory.io/) 脆弱性管理クラウド向けサーバーです。AI エージェントを yamory のナレッジベースに接続し、**何が検出されたか、どの程度危険か、どう修正すべきか**を提供します。

---

## クイックセットアップ

### 1. API トークンの取得

1. [yamory](https://yamory.io/) にログイン
2. **チーム設定** > **API トークン** に移動
3. 用途に **API Server** を選択して **トークンを発行** をクリック
4. 環境変数にトークンを設定:

```bash
export YAMORY_API_TOKEN="your-token-here"
```

> **ヒント**: シェルプロファイル（`~/.zshrc`、`~/.bashrc` など）に追加すると、セッション間で保持されます。

### 2. MCP クライアントへの追加

**Claude Code**

```bash
claude mcp add yamory \
  --env YAMORY_API_TOKEN=$YAMORY_API_TOKEN \
  -- npx @aranseshita/yamory-mcp-server@latest
```

**Claude Desktop** — `claude_desktop_config.json` に追加:

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

**チーム共有 (Claude Code)** — プロジェクトルートに `.mcp.json` を追加。各メンバーは自身の環境で `YAMORY_API_TOKEN` を設定:

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

## 何を聞ける？

### 脆弱性の確認と修正

チームの現在の脆弱性を確認し、実行可能な修正ガイダンスを取得できます。コーディングエージェントと組み合わせて自動修正も可能です。

```
「未対応の脆弱性を一覧表示して」
「即時対応が必要な脆弱性は？」
「log4j の脆弱性はどう修正する？」
「影響を受けるパッケージを更新して PR を作成して」
```

### CVE 影響分析

新しい CVE が公開された際、プロジェクトへの影響を即座に確認できます。

```
「CVE-2024-XXXXX は影響ある？」
「脆弱なパッケージを使用しているプロジェクトを一覧表示して」
「影響と修正手順をまとめて」
```

### レポートとトリアージ

定例会、監査、セキュリティレビュー向けのサマリーを生成できます。

```
「今月の脆弱性状況をまとめて」
「即時対応の未解決問題があるプロジェクトは？」
「CISA KEV カタログに含まれる RCE 脆弱性を表示して」
「今月新たに検出された脆弱性は何件？」
```

---

## ツール

本サーバーは5つのツールを提供します。MCP クライアントが全パラメータを自動検出します。主要なフィルターは以下の通りです。

| ツール | 説明 |
|--------|------|
| `search_vulns` | アプリライブラリとコンテナイメージの脆弱性を一括検索（推奨デフォルト） |
| `search_app_vulns` | アプリライブラリ（npm, Maven, pip 等）の脆弱性を検索 |
| `search_container_vulns` | コンテナイメージの脆弱性を検索 |
| `search_host_vulns` | ホスト（OS レベル）の脆弱性を検索 |
| `search_asset_vulns` | IT 資産（ネットワーク機器等）の脆弱性を検索 |

**共通フィルター**:

| フィルター | 例 | 説明 |
|------------|-----|------|
| `keyword` | `log4j`, `CVE-2024-1234` | プロジェクト名、パッケージ名、CVE-ID で検索 |
| `triageLevel` | `immediate,delayed` | トリアージ優先度 |
| `status` | `open` | 脆弱性のステータス |
| `vulnType` | `RCE`, `XSS`, `SQLI` | 脆弱性カテゴリ |
| `cvssScore` | `9.0` | 最低 CVSS スコア |
| `includeKev` | `true` | CISA KEV に含まれる脆弱性のみ |
| `includePoc` | `true` | 公開 PoC がある脆弱性のみ |
| `openTimestamp` | `2024-01-01` | この日付以降に検出されたもの |

> これらを覚える必要はありません。自然言語で検索したい内容を伝えれば、AI エージェントが適切なフィルターを選択します。

---

## 設定

### 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `YAMORY_API_TOKEN` | はい | yamory チーム設定から取得した API トークン |
| `YAMORY_TEAM_NAME` | いいえ | チーム名でフィルタリング。組織全体にアクセスする場合は `*` を設定（セキュリティチームトークンのみ） |

### スコープフィルター

yamory API トークンはチーム単位でスコープが設定されます。`YAMORY_TEAM_NAME` でさらにフィルタリングできます:

| シナリオ | トークン | `YAMORY_TEAM_NAME` | 結果 |
|----------|----------|---------------------|------|
| 開発者 | チームトークン | _（未設定）_ | 自チームのデータのみ |
| セキュリティリード（1チーム） | セキュリティトークン | `Dev Team` | 指定チームに限定 |
| セキュリティリード（組織全体） | セキュリティトークン | `*` | 全チーム表示 |

### セキュリティ

- トークンをバージョン管理に**コミットしない**
- **環境変数**または `.mcp.json` の `${YAMORY_API_TOKEN}` 構文を使用
- 可能な限り `YAMORY_TEAM_NAME` で**スコープを制限**
- yamory チーム設定から定期的に**トークンをローテーション**

---

## 免責事項

本プロジェクトは非公式のコミュニティ主導の統合です。yamory および Assured 株式会社とは一切の提携・推奨・サポート関係にありません。「yamory」は Assured 株式会社の商標です。yamory API の使用は yamory の利用規約に従います。

</details>
