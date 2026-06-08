# HCSL Public Discovery API

The HCSL public discovery API is a read-only set of static endpoints for automated discovery of HCSL web resources.

No account, token, OAuth grant, or agent registration is required for the public endpoints listed here.

## Endpoints

- `GET /llms.txt`: LLM guidance and authoritative resource links.
- `GET /.well-known/api-catalog`: RFC 9727 API catalog linkset.
- `GET /.well-known/agent-skills/index.json`: Agent skills discovery index.
- `GET /.well-known/mcp/server-card.json`: MCP server card for browser-exposed WebMCP tools.
- `GET /.well-known/oauth-protected-resource`: Public-resource authentication metadata.
- `GET /.well-known/status.json`: Discovery endpoint status.

## Authentication

HCSL does not currently operate protected APIs for the public website. Agents should use the public resources directly and should not request credentials for site access.
