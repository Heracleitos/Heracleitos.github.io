# Auth.md

## HCSL Agent Authentication

Hellenic Complex Systems Laboratory (HCSL) does not currently operate protected public APIs, user accounts, or agent-specific registration flows for the public website.

Agents may access public HCSL resources without OAuth credentials.

## Registration Status

- Agent registration required: no
- Supported registration flows: anonymous public-read discovery
- Credentials issued to agents: none
- Public read scope: `public.read`

## Agent Auth Metadata

```json
{
  "agent_auth": {
    "skill": "https://www.hcsl.com/auth.md",
    "register_uri": "https://www.hcsl.com/auth.md",
    "registration_required": false,
    "identity_types_supported": ["anonymous"],
    "anonymous": {
      "credential_types_supported": ["none"]
    },
    "claim_uri": "https://www.hcsl.com/auth.md#registration-status",
    "revocation_uri": "https://www.hcsl.com/auth.md#protected-api-notice",
    "events_supported": []
  }
}
```

## Public Discovery Resources

- API catalog: `https://www.hcsl.com/.well-known/api-catalog`
- OpenAPI description: `https://www.hcsl.com/.well-known/openapi.json`
- Agent skills index: `https://www.hcsl.com/.well-known/agent-skills/index.json`
- MCP server card: `https://www.hcsl.com/.well-known/mcp/server-card.json`
- LLM guidance: `https://www.hcsl.com/llms.txt`

## Protected API Notice

If HCSL later introduces protected APIs, this file and the OAuth metadata at `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` should be updated with working authorization, token, key, claim, and revocation endpoints before agents request credentials.
