# Browserbase MCP Server

![cover](../assets/browserbase-mcp.png)

The Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools. Whether you're building an AI-powered IDE, enhancing a chat interface, or creating custom AI workflows, MCP provides a standardized way to connect LLMs with the context they need. 

<div>
   <a href="https://www.loom.com/share/d285d6093b2843e98908c65592031218">
   <img style="max-width:600px;" src="https://cdn.loom.com/sessions/thumbnails/d285d6093b2843e98908c65592031218-1ab1288912ffd40c-full-play.gif">
   </a>
</div>

## How to Setup

### Quickstarts: 

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.png)](cursor://anysphere.cursor-deeplink/mcp/install?name=browserbase&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJAYnJvd3NlcmJhc2VocS9tY3AiXSwiZW52Ijp7IkJST1dTRVJCQVNFX0FQSV9LRVkiOiIiLCJCUk9XU0VSQkFTRV9QUk9KRUNUX0lEIjoiIn19)

You can either use our Server hosted on NPM or run it completely locally by cloning this repo. 

### To run on NPM (Recommended)

Go into your MCP Config JSON and add the Browserbase Server:

```json
{
   "mcpServers": {
      "browserbase": {
         "command": "npx",
         "args" : ["@browserbasehq/mcp"],
         "env": {
            "BROWSERBASE_API_KEY": "",
            "BROWSERBASE_PROJECT_ID": ""
         }
      }
   }
}
```

Thats it! Reload your MCP client and Claude will be able to use Browserbase. 

### To run 100% local: 

```bash
# Clone the Repo 
git clone https://github.com/browserbase/mcp-server-browserbase.git

# Install the dependencies in the proper directory and build the project
cd stagehand
npm install && npm run build

```

Then in your MCP Config JSON run the server. To run locally we can use STDIO or self-host over SSE. 

### STDIO: 

To your MCP Config JSON file add the following: 

```json
{
"mcpServers": {
   "browserbase": {
      "command" : "node",
      "args" : ["/path/to/mcp-server-browserbase/stagehand/cli.js"],
      "env": {
         "BROWSERBASE_API_KEY": "",
         "BROWSERBASE_PROJECT_ID": ""
         }
      }
   }
}
```

### SSE: 

Run the following command in your terminal. You can add any flags (see options below) that you see fit to customize your configuration. 

```bash
   node cli.js --port 8931
```

Then in your MCP Config JSON file put the following: 

```json
   {
      "mcpServers": {
         "browserbase": {
            "url": "http://localhost:8931/sse",
            "env": {
               "BROWSERBASE_API_KEY": "",
               "BROWSERBASE_PROJECT_ID": ""
            }
         }
      }
   }
```

Then reload your MCP client and you should be good to go!

## Flags Explained:

The Browserbase MCP server accepts the following command-line flags:

| Flag | Description |
|------|-------------|
| `--browserbaseApiKey <key>` | Your Browserbase API key for authentication |
| `--browserbaseProjectId <id>` | Your Browserbase project ID |
| `--proxies` | Enable Browserbase proxies for the session |
| `--advancedStealth` | Enable Browserbase Advanced Stealth (Only for Scale Plan Users) | 
| `--contextId <contextId>` | Specify a Browserbase Context ID to use |
| `--persist [boolean]` | Whether to persist the Browserbase context (default: true) |
| `--port <port>` | Port to listen on for HTTP/SSE transport |
| `--host <host>` | Host to bind server to (default: localhost, use 0.0.0.0 for all interfaces) |
| `--cookies [json]` | JSON array of cookies to inject into the browser |
| `--browserWidth <width>` | Browser viewport width (default: 1024) |
| `--browserHeight <height>` | Browser viewport height (default: 768) |
| `--modelName <model>` | The model to use for Stagehand (default: google/gemini-2.0-flash) |

These flags can be passed directly to the CLI or configured in your MCP configuration file.

### NOTE: 

Currently, these flags can only be used with the local server (npx @browserbasehq/mcp). 

____

## Flags & Example Configs

### Proxies

Here are our docs on [Proxies](https://docs.browserbase.com/features/proxies).

To use proxies in STDIO, set the --proxies flag in your MCP Config:

```json
{
   "mcpServers": {
      "browserbase": {
         "command" : "npx",
         "args" : ["@browserbasehq/mcp", "--proxies"],
         "env": {
            "BROWSERBASE_API_KEY": "",
            "BROWSERBASE_PROJECT_ID": ""
         }
      }
   }
}
```
### Advanced Stealth 

Here are our docs on [Advanced Stealth](https://docs.browserbase.com/features/stealth-mode#advanced-stealth-mode).

To use proxies in STDIO, set the --advancedStealth flag in your MCP Config:

```json
{
   "mcpServers": {
      "browserbase": {
         "command" : "npx",
         "args" : ["@browserbasehq/mcp", "--advancedStealth"],
         "env": {
            "BROWSERBASE_API_KEY": "",
            "BROWSERBASE_PROJECT_ID": ""
         }
      }
   }
}
```

### Contexts

Here are our docs on [Contexts](https://docs.browserbase.com/features/contexts)

To use contexts in STDIO, set the --contextId flag in your MCP Config:

```json
{
   "mcpServers": {
      "browserbase": {
         "command" : "npx",
         "args" : ["@browserbasehq/mcp", "--contextId", "<YOUR_CONTEXT_ID>"],
         "env": {
            "BROWSERBASE_API_KEY": "",
            "BROWSERBASE_PROJECT_ID": ""
         }
      }
   }
}
```

### Cookie Injection

Why would you need to inject cookies? Our context API currently works on persistent cookies, but not session cookies. So sometimes our persistent auth might not work (we're working hard to add this functionality). 

You can flag cookies into the MCP by adding the cookies.json to your MCP Config.

To use proxies in STDIO, set the --proxies flag in your MCP Config. Your cookies JSON must be in the type of [Playwright Cookies](https://playwright.dev/docs/api/class-browsercontext#browser-context-cookies)

```json
{
   "mcpServers": {
      "browserbase" {
         "command" : "npx",
         "args" : [
            "@browserbasehq/mcp", "--cookies", 
            '{
               "cookies": json,
            }'
         ],
         "env": {
            "BROWSERBASE_API_KEY": "",
            "BROWSERBASE_PROJECT_ID": ""
         }
      }
   }
}
```

### Browser Viewport Sizing 

The default viewport sizing for a browser session is 1024 x 768. You can adjust the Browser viewport sizing with browserWidth and browserHeight flags. 

Here's how to use it for custom browser sizing. We recommend to stick with 16:9 aspect ratios (ie: 1920 x 1080, 1280, 720, 1024 x 768)

```json
{
   "mcpServers": {
      "browserbase": {
         "command" : "npx",
         "args" : [
            "@browserbasehq/mcp",
            "--browserHeight 1080",
            "--browserWidth 1920",
         ],
         "env": {
            "BROWSERBASE_API_KEY": "",
            "BROWSERBASE_PROJECT_ID": ""
         }
      }
   }
}
```

### Model Configuration 

Stagehand defaults to using Google's Gemini 2.0 Flash model, but you can configure it to use other models like GPT-4o, Claude, or other providers.

Here's how to configure different models:

```json
{
   "mcpServers": {
      "browserbase": {
         "command" : "npx",
         "args" : [
            "@browserbasehq/mcp",
            "--modelName", "gpt-4o",
         ],
         "env": {
            "BROWSERBASE_API_KEY": "",
            "BROWSERBASE_PROJECT_ID": ""
         }
      }
   }
}
```

Available models include:
- **Gemini**: `google/gemini-2.0-flash` (default), `google/gemini-1.5-pro`, `google/gemini-1.5-flash`
- **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `o1-mini`, `o1-preview`, `o3-mini`
- **Claude**: `claude-3-5-sonnet-latest`, `claude-3-7-sonnet-latest`
- **Other providers**: Cerebras, Groq, and more

* Note: 
The model must be supported in Stagehand. Checkout the docs [here](https://docs.stagehand.dev/examples/custom_llms#supported-llms).

## Structure

*   `src/`: TypeScript source code
    *   `index.ts`: Main entry point and Smithery default export function
    *   `config.ts`: Configuration management and CLI option parsing
    *   `context.ts`: Context class managing Stagehand instances and tool execution
    *   `logging.ts`: Comprehensive logging system with file rotation
    *   `program.ts`: CLI program setup using Commander.js
    *   `prompts.ts`: Prompt templates for MCP clients
    *   `resources.ts`: Resource management for screenshots
    *   `server.ts`: Server list management for multiple server instances
    *   `sessionManager.ts`: Browserbase session creation and lifecycle management
    *   `transport.ts`: HTTP/SSE and STDIO transport handlers
    *   `utils.ts`: Utility functions for message sanitization
    *   `tools/`: Tool definitions and implementations
        *   `act.ts`: Stagehand action execution tool
        *   `extract.ts`: Page content extraction tool
        *   `navigate.ts`: URL navigation tool
        *   `observe.ts`: Element observation tool
        *   `screenshot.ts`: Screenshot capture tool
        *   `session.ts`: Session management tools (create/close)
        *   `tool.ts`: Tool type definitions and interfaces
        *   `utils.ts`: Tool utility functions
*   `dist/`: Compiled JavaScript output
*   `tests/`: Placeholder for tests (coming soon)
*   `cli.js`: Executable entry point for CLI usage
*   `config.d.ts`: TypeScript type definitions for configuration
*   `index.d.ts` & `index.js`: Module exports for programmatic usage
*   `package.json`: Package metadata and dependencies
*   `smithery.config.js` & `smithery.yaml`: Smithery configuration files
*   `tsconfig.json`: TypeScript compiler configuration
*   Configuration files (`.json`, `.ts`, `.mjs`, `.npmignore`)

## Tools

### Stagehand Tools (Browserbase MCP)

- **stagehand_navigate**
  - Navigate to any URL in the browser
  - Input:
    - `url` (string): The URL to navigate to

- **stagehand_act**
  - Perform an action on the web page
  - Inputs:
    - `action` (string): The action to perform (e.g., "click the login button")
    - `variables` (object, optional): Variables used in the action template

- **stagehand_extract**
  - Extract all text content from the current page (filters out CSS and JavaScript)
  - No inputs required

- **stagehand_observe**
  - Observe actions that can be performed on the web page
  - Input:
    - `instruction` (string): Specific instruction for observation (e.g., "find the login button")

- **screenshot**
  - Capture a PNG screenshot of the current page 
  - Output:
    - `text`: Friendly confirmation message with the screenshot name
    - `image`: Base-64 encoded PNG data

### Session Management Tools

- **browserbase_session_create**
  - Create or reuse a cloud browser session using Browserbase with fully initialized Stagehand
  - Applies all configuration flags (proxies, stealth, viewport, cookies, etc.)
  - Initializes Stagehand instance connected to the browser session
  - Input:
    - `sessionId` (string, optional): Optional session ID to use/reuse. If not provided, creates new session
  - Output:
    - Live debugger URL for the Browserbase session

- **browserbase_session_close**
  - Close the current Browserbase session, disconnect the browser, and cleanup Stagehand instance
  - Input:
    - `random_string` (string, optional): Dummy parameter for consistent tool call format
  - Output:
    - Confirmation message and session replay URL

### Resources

The server provides access to screenshot resources:

1. **Screenshots** (`screenshot://<screenshot-name>`)
   - PNG images of captured screenshots

## File Structure

The Stagehand MCP server codebase is organized into the following key modules:

- **index.ts**: Smithery default export function that creates and configures the MCP server
- **config.ts**: Configuration management, CLI option parsing, and environment variable handling
- **context.ts**: Context class that manages Stagehand instances, tool execution, and browser sessions
- **program.ts**: CLI program setup using Commander.js with all command-line options
- **server.ts**: Server list management for handling multiple server instances
- **sessionManager.ts**: Browserbase session creation, lifecycle management, and cleanup
- **transport.ts**: HTTP/SSE and STDIO transport handlers for different connection types
- **logging.ts**: Comprehensive logging system with file rotation and in-memory logs
- **prompts.ts**: Prompt templates for MCP clients
- **resources.ts**: Screenshot resource management and URI handling
- **utils.ts**: Message sanitization utilities
- **tools/**: Individual tool implementations with type-safe schemas

## Module Descriptions

### index.ts

The Smithery default export function that:
- Defines the configuration schema with Zod validation
- Creates the MCP server instance with proper metadata
- Registers all tools with their schemas and handlers
- Returns the configured server for use by Smithery or direct imports

### config.ts

Configuration management module that:
- Defines CLI option types and default values
- Resolves configuration from environment variables, CLI args, and defaults
- Provides utility functions for file paths and config merging
- Handles Browserbase API key and project ID validation

### context.ts

The main Context class that:
- Manages Stagehand instances per session with lifecycle handling
- Executes tool actions with proper error handling and logging
- Provides access to active browser pages and sessions
- Handles resource listing and reading for screenshots
- Coordinates between tools, sessions, and the MCP server

### program.ts

CLI program setup using Commander.js that:
- Defines all command-line options and flags
- Parses arguments and resolves final configuration
- Sets up exit handlers for graceful shutdown
- Starts either HTTP/SSE or STDIO transport based on options

### server.ts

Server list management that:
- Maintains multiple server instances for different connections
- Provides factory pattern for server creation
- Handles server lifecycle and cleanup
- Manages concurrent server connections

### sessionManager.ts

Browserbase session management that:
- Creates and connects to Browserbase sessions via CDP
- Manages session lifecycle with automatic cleanup
- Handles default and custom session IDs
- Provides cookie injection and context management
- Tracks active sessions and handles disconnections

### transport.ts

Transport layer implementations for:
- STDIO transport for direct MCP communication
- HTTP/SSE transport for web-based connections
- Streamable HTTP transport for advanced clients
- Session management across different transport types

### prompts.ts

Prompt template definitions:
- Exports available prompts list
- Provides `click_search_button` template
- Handles prompt retrieval by name with validation

### resources.ts

Resource management for the MCP protocol:
- Manages screenshot storage in memory
- Provides resource listing for available screenshots
- Handles resource URI resolution and content retrieval
- Returns base64-encoded PNG data for screenshot resources

### utils.ts

Message sanitization utilities:
- `sanitizeMessage`: Ensures proper JSON formatting for MCP messages
- Error handling for malformed JSON with fallback responses

### tools/ Directory

Individual tool implementations with:
- **act.ts**: Stagehand action execution with variable support
- **extract.ts**: Page content extraction with CSS/JS filtering
- **navigate.ts**: URL navigation with network waiting
- **observe.ts**: Element observation with specific instructions
- **screenshot.ts**: Screenshot capture with base64 encoding
- **session.ts**: Session create/close tools with Browserbase integration
- **tool.ts**: Type definitions and interfaces for all tools
- **utils.ts**: Shared utility functions for file path sanitization

## Key Features

- AI-powered web automation
- Perform actions on web pages
- Extract structured data from web pages
- Observe possible actions on web pages
- Simple and extensible API
- Model-agnostic support for various LLM providers

## Environment Variables

- `BROWSERBASE_API_KEY`: API key for BrowserBase authentication
- `BROWSERBASE_PROJECT_ID`: Project ID for BrowserBase
- `DEBUG`: Enable debug logging

## MCP Capabilities

This server implements the following MCP capabilities:

- **Tools**: Provides 7 tools for browser automation:
  - Stagehand tools: navigate, act, extract, observe, screenshot
  - Session management: create and close Browserbase sessions
- **Prompts**: Provides prompt templates (click_search_button)
- **Resources**: Screenshot resource management with URI-based access
- **Logging**: Comprehensive logging with file rotation and MCP integration

For more information about the Model Context Protocol, visit:
- [MCP Documentation](https://modelcontextprotocol.io/docs)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## License

Licensed under the MIT License.

Copyright 2025 Browserbase, Inc.