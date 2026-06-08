const DISCOVERY_LINK =
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", ' +
  '</llms.txt>; rel="service-doc"; type="text/plain", ' +
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json", ' +
  '</.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"';

const CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";

const CONTENT_TYPES = {
  "/.well-known/api-catalog": "application/linkset+json; charset=utf-8",
  "/.well-known/oauth-protected-resource": "application/json; charset=utf-8",
  "/.well-known/oauth-authorization-server": "application/json; charset=utf-8",
  "/.well-known/openapi.json": "application/openapi+json; charset=utf-8",
  "/.well-known/status.json": "application/json; charset=utf-8",
  "/.well-known/agent-skills/index.json": "application/json; charset=utf-8",
  "/.well-known/agent-skills/discover-hcsl/SKILL.md": "text/markdown; charset=utf-8",
  "/.well-known/mcp/server-card.json": "application/json; charset=utf-8",
  "/auth.md": "text/markdown; charset=utf-8",
  "/index.md": "text/markdown; charset=utf-8"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (isHome(url.pathname) && acceptsMarkdown(request.headers.get("Accept"))) {
      const markdownUrl = new URL("/index.md", url);
      const markdownRequest = new Request(markdownUrl.toString(), request);
      const markdownAsset = await env.ASSETS.fetch(markdownRequest);

      if (markdownAsset.ok) {
        const markdown = await markdownAsset.text();
        const headers = new Headers(markdownAsset.headers);
        headers.set("content-type", CONTENT_TYPES["/index.md"]);
        headers.set("vary", mergeHeader(headers.get("vary"), "Accept"));
        headers.set("x-markdown-tokens", estimateTokens(markdown).toString());
        headers.set("content-signal", CONTENT_SIGNAL);
        headers.set("link", DISCOVERY_LINK);
        return new Response(markdown, {
          status: 200,
          statusText: "OK",
          headers
        });
      }
    }

    const response = await env.ASSETS.fetch(request);
    return withDiscoveryHeaders(response, url);
  }
};

function withDiscoveryHeaders(response, url) {
  const headers = new Headers(response.headers);
  const contentType = CONTENT_TYPES[url.pathname];

  if (contentType && response.ok) {
    headers.set("content-type", contentType);
  }

  if (isHome(url.pathname)) {
    headers.set("link", DISCOVERY_LINK);
    headers.set("vary", mergeHeader(headers.get("vary"), "Accept"));
    headers.set("content-signal", CONTENT_SIGNAL);
  }

  if (url.pathname.startsWith("/.well-known/") || url.pathname === "/auth.md") {
    headers.set("access-control-allow-origin", "*");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function isHome(pathname) {
  return pathname === "/" || pathname === "/index.html";
}

function acceptsMarkdown(acceptHeader) {
  return typeof acceptHeader === "string" && /\btext\/markdown\b/i.test(acceptHeader);
}

function mergeHeader(existing, value) {
  if (!existing) {
    return value;
  }

  const lowerValue = value.toLowerCase();
  const values = existing.split(",").map((item) => item.trim().toLowerCase());
  return values.includes(lowerValue) ? existing : `${existing}, ${value}`;
}

function estimateTokens(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words * 1.35));
}
