const DISCOVERY_LINK =
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", ' +
  '</llms.txt>; rel="service-doc"; type="text/plain", ' +
  '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json", ' +
  '</.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"';

const CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";

const HOMEPAGE_MARKDOWN = `---
title: Hellenic Complex Systems Laboratory
description: Independent virtual research laboratory focused on uncertainty in complex systems, laboratory medicine, quality control, diagnostic accuracy, and Bayesian diagnosis.
url: https://www.hcsl.com/
---

# Hellenic Complex Systems Laboratory

Hellenic Complex Systems Laboratory (HCSL) is an independent virtual research laboratory, established in 1993, dedicated to the evaluation and reduction of uncertainty in complex systems.

Through a transdisciplinary framework, HCSL develops original clinical, laboratory, research, and educational tools for assessing and addressing uncertainties inherent in complex processes.

## Scientific Focus

- Analytical quality control (QC) in laboratory medicine.
- Measurement uncertainty and diagnostic accuracy.
- Bayesian methods for medical diagnosis.
- Clinical and statistical computation.
- Complex systems methods.

## Resources

- [Research Notes](https://www.hcsl.com/Notes/index.html)
- [Publications](https://www.hcsl.com/Publications/index.html)
- [Technical Reports](https://www.hcsl.com/TR/index.html)
- [Software](https://www.hcsl.com/Tools/index.html)
- [Institutional Information](https://www.hcsl.com/About/index.html#HCSL)
- [Glossary](https://www.hcsl.com/Glossary/index.html)

## Agent Discovery

- [LLM guidance](https://www.hcsl.com/llms.txt)
- [API catalog](https://www.hcsl.com/.well-known/api-catalog)
- [Agent skills index](https://www.hcsl.com/.well-known/agent-skills/index.json)
- [MCP server card](https://www.hcsl.com/.well-known/mcp/server-card.json)
- [Agent registration guidance](https://www.hcsl.com/auth.md)

HCSL public resources are available for research and educational use. They do not provide clinical guidance and do not require agent registration or OAuth credentials.
`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (isHome(url.pathname) && acceptsMarkdown(request.headers.get("Accept"))) {
      const headers = new Headers({
        "content-type": "text/markdown; charset=utf-8",
        "vary": "Accept",
        "x-markdown-tokens": estimateTokens(HOMEPAGE_MARKDOWN).toString(),
        "content-signal": CONTENT_SIGNAL,
        "link": DISCOVERY_LINK,
        "cache-control": "public, max-age=300"
      });

      return new Response(request.method === "HEAD" ? null : HOMEPAGE_MARKDOWN, {
        status: 200,
        headers
      });
    }

    const response = await fetch(request);
    const headers = new Headers(response.headers);

    if (isHome(url.pathname)) {
      headers.set("link", DISCOVERY_LINK);
      headers.set("vary", mergeHeader(headers.get("vary"), "Accept"));
      headers.set("content-signal", CONTENT_SIGNAL);
    }

    if (url.pathname === "/auth.md") {
      headers.set("content-type", "text/markdown; charset=utf-8");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};

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
