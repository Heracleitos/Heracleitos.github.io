(function () {
  "use strict";

  const resources = [
    {
      title: "Research Notes",
      category: "research",
      url: "https://www.hcsl.com/Notes/index.html",
      description: "Methodological notes on uncertainty, diagnosis, quality control, and risk."
    },
    {
      title: "Publications",
      category: "publications",
      url: "https://www.hcsl.com/Publications/index.html",
      description: "Peer-reviewed publications organized by HCSL research theme."
    },
    {
      title: "Technical Reports",
      category: "technical-reports",
      url: "https://www.hcsl.com/TR/index.html",
      description: "HCSL technical report catalogue with abstracts and full texts."
    },
    {
      title: "Software",
      category: "software",
      url: "https://www.hcsl.com/Tools/index.html",
      description: "Computational notebooks, software tools, and Wolfram Demonstrations."
    },
    {
      title: "Glossary",
      category: "reference",
      url: "https://www.hcsl.com/Glossary/index.html",
      description: "Definitions of terms used across the HCSL site."
    },
    {
      title: "Contact",
      category: "contact",
      url: "https://www.hcsl.com/Contact/index.html",
      description: "Official HCSL contact information."
    }
  ];

  const tools = [
    {
      name: "hcsl.search",
      title: "Search HCSL Resources",
      description: "Search the main public HCSL resource categories by keyword and return matching links.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            minLength: 1,
            maxLength: 120,
            description: "Keyword or phrase to match against HCSL resource titles and descriptions."
          }
        },
        required: ["query"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: false
      },
      execute: async function (input) {
        const query = String(input && input.query ? input.query : "").trim().toLowerCase();
        const matches = resources.filter(function (resource) {
          const haystack = [resource.title, resource.category, resource.description].join(" ").toLowerCase();
          return haystack.indexOf(query) !== -1;
        });
        return {
          query,
          results: matches
        };
      }
    },
    {
      name: "hcsl.list_resources",
      title: "List HCSL Resources",
      description: "Return public HCSL resource links, optionally filtered by category.",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["all", "research", "publications", "technical-reports", "software", "reference", "contact"],
            default: "all"
          }
        },
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: false
      },
      execute: async function (input) {
        const category = input && input.category ? input.category : "all";
        return {
          category,
          results: category === "all" ? resources : resources.filter(function (resource) {
            return resource.category === category;
          })
        };
      }
    },
    {
      name: "hcsl.site_summary",
      title: "Summarize HCSL",
      description: "Return a concise summary of HCSL scope, status, and agent discovery endpoints.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: false
      },
      execute: async function () {
        return {
          name: "Hellenic Complex Systems Laboratory",
          alternateName: "HCSL",
          founded: "1993",
          location: "Drama, Greece",
          scope: "Independent virtual research laboratory focused on uncertainty evaluation and reduction in complex systems, especially laboratory medicine, diagnostic accuracy, measurement uncertainty, Bayesian diagnosis, and statistical quality control.",
          discovery: {
            llms: "https://www.hcsl.com/llms.txt",
            apiCatalog: "https://www.hcsl.com/.well-known/api-catalog",
            skills: "https://www.hcsl.com/.well-known/agent-skills/index.json",
            mcpServerCard: "https://www.hcsl.com/.well-known/mcp/server-card.json",
            auth: "https://www.hcsl.com/auth.md"
          }
        };
      }
    },
    {
      name: "hcsl.open_section",
      title: "Open HCSL Section",
      description: "Navigate the browser to a selected public HCSL section.",
      inputSchema: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["research", "publications", "technical-reports", "software", "reference", "contact"]
          }
        },
        required: ["section"],
        additionalProperties: false
      },
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: false
      },
      execute: async function (input) {
        const match = resources.find(function (resource) {
          return resource.category === input.section;
        });

        if (!match) {
          return { error: "Unknown section." };
        }

        window.location.href = match.url;
        return {
          navigatingTo: match.url
        };
      }
    }
  ];

  function registerWithDocumentModelContext() {
    if (!document.modelContext || typeof document.modelContext.registerTool !== "function") {
      return false;
    }

    tools.forEach(function (tool) {
      try {
        document.modelContext.registerTool(tool);
      } catch (error) {
        if (window.console && typeof window.console.debug === "function") {
          window.console.debug("WebMCP tool registration skipped:", tool.name, error);
        }
      }
    });

    return true;
  }

  function registerWithNavigatorModelContext() {
    if (!navigator.modelContext || typeof navigator.modelContext.provideContext !== "function") {
      return false;
    }

    try {
      navigator.modelContext.provideContext({
        tools: tools
      });
      return true;
    } catch (error) {
      if (window.console && typeof window.console.debug === "function") {
        window.console.debug("Navigator WebMCP context registration skipped:", error);
      }
      return false;
    }
  }

  registerWithDocumentModelContext();
  registerWithNavigatorModelContext();
})();
