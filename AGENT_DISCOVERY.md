# HCSL Agent Discovery Deployment Notes

These notes confirm which agent-readiness items are handled by repository files and which require Cloudflare or DNS configuration outside GitHub Pages.

## Repository Files Added

- `_headers`: Cloudflare Pages custom headers, including the homepage `Link` response header.
- `_worker.js`: Cloudflare Pages advanced Worker for `Accept: text/markdown` homepage negotiation and discovery headers.
- `index.md`: Markdown representation of the homepage for agents.
- `webmcp.js`: Browser WebMCP tool registration for the homepage.
- `auth.md`: Agent registration guidance for the public site.
- `.well-known/api-catalog`: RFC 9727 API catalog linkset.
- `.well-known/openapi.json`: OpenAPI description of public discovery endpoints.
- `.well-known/oauth-protected-resource`: OAuth protected resource metadata for public resources.
- `.well-known/oauth-authorization-server`: Public authorization metadata stating that agent registration is not required.
- `.well-known/mcp/server-card.json`: MCP server card for browser-exposed WebMCP tools.
- `.well-known/agent-skills/index.json`: Agent Skills discovery index.
- `.well-known/agent-skills/discover-hcsl/SKILL.md`: HCSL discovery skill.

## Confirmed Hashes

- `.well-known/agent-skills/discover-hcsl/SKILL.md`: `sha256:2fcc3a1288176f3c9d5061b7077b670688dfe2145dc53b941b6889b84c9dff68`
- `.well-known/agent-skills/index.json`: `sha256:d983417dcaf950de2c8f7dc8e62dcd8386ec32c53f5a9921e9f775fe45a3b8da`
- `.well-known/mcp/server-card.json`: `sha256:0450acfd9fe999fcbf9e8a88e982da8e4b6ee7de1dd4b8b6b5d5074653ef29b9`
- `.well-known/api-catalog`: `sha256:9e749611d873d738fdf3bcbb3004f173c4e75a073a7e79f663b9cb82761cb39a`

## Cloudflare Requirements

GitHub Pages does not honor `_headers` and cannot perform content negotiation by itself. To make the headers and Markdown negotiation active, use one of these deployment paths:

1. Deploy this repository with Cloudflare Pages. Cloudflare Pages will use `_headers`, and `_worker.js` will return `text/markdown` for homepage requests that send `Accept: text/markdown`.
2. If `www.hcsl.com` remains on GitHub Pages behind Cloudflare, configure a Cloudflare Worker route for `https://www.hcsl.com/*` using the same logic as `_worker.js`, or configure Cloudflare Transform Rules for the `Link` header and enable Markdown for Agents in Cloudflare.

Expected homepage `Link` header:

```http
Link: </.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", </llms.txt>; rel="service-doc"; type="text/plain", </.well-known/agent-skills/index.json>; rel="describedby"; type="application/json", </.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"
```

Expected Markdown negotiation check:

```powershell
curl.exe -I https://www.hcsl.com/ -H "Accept: text/markdown"
```

The response should include:

```http
Content-Type: text/markdown; charset=utf-8
Vary: Accept
x-markdown-tokens: <number>
```

## DNS-AID Requirements

DNS-AID records must be published in the authoritative DNS zone, not in this repository. Enable DNSSEC for the public zone before relying on DNS-AID for authenticated discovery.

Use `hcsl.com` as the organizational domain. If a scanner tests the exact web host, also publish the `www.hcsl.com` variants.

Preferred DNS-AID style if the DNS provider accepts the provisional `endpoint` and `cap-sha256` parameters:

```zone
_index._agents.hcsl.com. 3600 IN SVCB 1 www.hcsl.com. alpn="h2" port=443 endpoint="/.well-known/agent-skills/index.json" cap-sha256="2YNBfcr5UN4sj33I5i3Ng4bsMsU_Wpkh6fd1_kWjuNo"
_mcp._agents.hcsl.com.   3600 IN SVCB 1 www.hcsl.com. alpn="mcp,h2" port=443 endpoint="/.well-known/mcp/server-card.json" cap-sha256="BFCs_Z_pmfy_noqI6YLajktu594d1Li2tdUHRlPvKbk"
_a2a._agents.hcsl.com.   3600 IN SVCB 1 www.hcsl.com. alpn="a2a,h2" port=443 endpoint="/.well-known/api-catalog" cap-sha256="nnSWEdhz1zj987y7MATxc8TnWgc6fnn2Y7nLgnYcs5o"
```

RFC 9460-compatible private-key presentation if the DNS provider rejects provisional parameter names:

```zone
_index._agents.hcsl.com. 3600 IN SVCB 1 www.hcsl.com. alpn="h2" port=443 key65000="/.well-known/agent-skills/index.json" key65001="2YNBfcr5UN4sj33I5i3Ng4bsMsU_Wpkh6fd1_kWjuNo"
_mcp._agents.hcsl.com.   3600 IN SVCB 1 www.hcsl.com. alpn="mcp,h2" port=443 key65000="/.well-known/mcp/server-card.json" key65001="BFCs_Z_pmfy_noqI6YLajktu594d1Li2tdUHRlPvKbk"
_a2a._agents.hcsl.com.   3600 IN SVCB 1 www.hcsl.com. alpn="a2a,h2" port=443 key65000="/.well-known/api-catalog" key65001="nnSWEdhz1zj987y7MATxc8TnWgc6fnn2Y7nLgnYcs5o"
```

Optional exact-host variants:

```zone
_index._agents.www.hcsl.com. 3600 IN SVCB 1 www.hcsl.com. alpn="h2" port=443 endpoint="/.well-known/agent-skills/index.json" cap-sha256="2YNBfcr5UN4sj33I5i3Ng4bsMsU_Wpkh6fd1_kWjuNo"
_mcp._agents.www.hcsl.com.   3600 IN SVCB 1 www.hcsl.com. alpn="mcp,h2" port=443 endpoint="/.well-known/mcp/server-card.json" cap-sha256="BFCs_Z_pmfy_noqI6YLajktu594d1Li2tdUHRlPvKbk"
_a2a._agents.www.hcsl.com.   3600 IN SVCB 1 www.hcsl.com. alpn="a2a,h2" port=443 endpoint="/.well-known/api-catalog" cap-sha256="nnSWEdhz1zj987y7MATxc8TnWgc6fnn2Y7nLgnYcs5o"
```

Confirm after publication:

```powershell
Resolve-DnsName -Type SVCB _index._agents.hcsl.com
Resolve-DnsName -Type SVCB _mcp._agents.hcsl.com
Resolve-DnsName -Type SVCB _a2a._agents.hcsl.com
```
