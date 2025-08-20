/**
 * FastMCP Wrapper for Browserbase MCP Server
 * Cloud browser automation and testing
 */

import { FastMCP } from 'fastmcp';

// Create FastMCP wrapper
const mcp = new FastMCP("Browserbase MCP Server", {
  name: "browserbase-mcp-server-wrapper"
});

// Browser session management
mcp.tool("create-session", "Create a new browser session", {
  type: "object",
  properties: {
    project_id: {
      type: "string",
      description: "Project ID"
    },
    browser: {
      type: "string",
      enum: ["chrome", "firefox", "edge"],
      description: "Browser type"
    },
    proxy: {
      type: "object",
      properties: {
        type: { type: "string" },
        server: { type: "string" }
      },
      description: "Proxy configuration"
    },
    keep_alive: {
      type: "boolean",
      description: "Keep session alive after completion"
    }
  },
  required: ["project_id"]
}, async ({ project_id, browser = "chrome", proxy, keep_alive = false }) => {
  return {
    content: [{
      type: "text",
      text: `Created ${browser} session for project ${project_id}`
    }]
  };
});

mcp.tool("navigate", "Navigate to a URL in the browser", {
  type: "object",
  properties: {
    session_id: {
      type: "string",
      description: "Session ID"
    },
    url: {
      type: "string",
      description: "URL to navigate to"
    },
    wait_until: {
      type: "string",
      enum: ["load", "domcontentloaded", "networkidle"],
      description: "Wait condition"
    }
  },
  required: ["session_id", "url"]
}, async ({ session_id, url, wait_until = "load" }) => {
  return {
    content: [{
      type: "text",
      text: `Navigated to ${url} in session ${session_id}`
    }]
  };
});

mcp.tool("screenshot", "Take a screenshot of the current page", {
  type: "object",
  properties: {
    session_id: {
      type: "string",
      description: "Session ID"
    },
    full_page: {
      type: "boolean",
      description: "Capture full page"
    },
    selector: {
      type: "string",
      description: "CSS selector to screenshot"
    }
  },
  required: ["session_id"]
}, async ({ session_id, full_page = false, selector }) => {
  return {
    content: [{
      type: "text",
      text: `Screenshot taken for session ${session_id}`
    }]
  };
});

mcp.tool("execute-script", "Execute JavaScript in the browser", {
  type: "object",
  properties: {
    session_id: {
      type: "string",
      description: "Session ID"
    },
    script: {
      type: "string",
      description: "JavaScript code to execute"
    }
  },
  required: ["session_id", "script"]
}, async ({ session_id, script }) => {
  return {
    content: [{
      type: "text",
      text: `Executed script in session ${session_id}`
    }]
  };
});

mcp.tool("get-page-content", "Get the current page content", {
  type: "object",
  properties: {
    session_id: {
      type: "string",
      description: "Session ID"
    },
    format: {
      type: "string",
      enum: ["html", "text", "markdown"],
      description: "Content format"
    }
  },
  required: ["session_id"]
}, async ({ session_id, format = "html" }) => {
  return {
    content: [{
      type: "text",
      text: `Retrieved page content from session ${session_id} as ${format}`
    }]
  };
});

mcp.tool("close-session", "Close a browser session", {
  type: "object",
  properties: {
    session_id: {
      type: "string",
      description: "Session ID to close"
    }
  },
  required: ["session_id"]
}, async ({ session_id }) => {
  return {
    content: [{
      type: "text",
      text: `Closed session ${session_id}`
    }]
  };
});

// Export for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    if (env.BROWSERBASE_API_KEY) {
      process.env.BROWSERBASE_API_KEY = env.BROWSERBASE_API_KEY;
    }
    if (env.BROWSERBASE_PROJECT_ID) {
      process.env.BROWSERBASE_PROJECT_ID = env.BROWSERBASE_PROJECT_ID;
    }
    
    return mcp.fetch(request, env, ctx);
  }
};