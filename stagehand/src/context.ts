import { Stagehand } from "@browserbasehq/stagehand";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Config } from "../config.js";
import { CallToolResult, TextContent, ImageContent } from "@modelcontextprotocol/sdk/types.js";
import { listResources, readResource } from "./resources.js";
import { 
  ensureLogDirectory, 
  setupLogRotation, 
  registerExitHandlers, 
  scheduleLogRotation,
  setServerInstance,
  log 
} from "./logging.js";
import { 
  getSession, 
  defaultSessionId, 
  type BrowserSession 
} from "./sessionManager.js";

export type ToolActionResult =
  | { content?: (ImageContent | TextContent)[] }
  | undefined
  | void;

export class Context {
  private stagehands = new Map<string, Stagehand>();
  public readonly config: Config;
  private server: Server;
  public currentSessionId: string = defaultSessionId;

  constructor(server: Server, config: Config) {
    this.server = server;
    this.config = config;
    
    // Initialize logging system
    setServerInstance(server);
    ensureLogDirectory();
    setupLogRotation();
    registerExitHandlers();
    scheduleLogRotation();
  }

  /**
   * Gets the Stagehand instance for the current session, creating one if needed
   */
  public async getStagehand(sessionId: string = this.currentSessionId): Promise<Stagehand> {
    let stagehand = this.stagehands.get(sessionId);
    
    if (!stagehand) {
      // Create a new Stagehand instance for this session
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        logger: (logLine) => {
          log(`Stagehand[${sessionId}]: ${logLine.message}`, 'info');
        },
      });
      this.stagehands.set(sessionId, stagehand);
    }

    await stagehand.init();
    
    return stagehand;
  }

  /**
   * Sets the Stagehand instance for a specific session
   */
  public setStagehand(sessionId: string, stagehand: Stagehand): void {
    this.stagehands.set(sessionId, stagehand);
  }

  /**
   * Removes the Stagehand instance for a specific session
   */
  public async removeStagehand(sessionId: string): Promise<void> {
    const stagehand = this.stagehands.get(sessionId);
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (error) {
        log(`Error closing Stagehand for session ${sessionId}: ${error}`, 'error');
      }
      this.stagehands.delete(sessionId);
    }
  }
  public async getActivePage(): Promise<BrowserSession["page"] | null> {
    // Try to get page from Stagehand first (if available for this session)
    const stagehand = this.stagehands.get(this.currentSessionId);
    if (stagehand && stagehand.page && !stagehand.page.isClosed()) {
      return stagehand.page;
    }
    
    // Fallback to session manager
    const session = await getSession(this.currentSessionId, this.config);
    if (session && session.page && !session.page.isClosed()) {
      return session.page;
    }
    
    return null;
  }

  public async getActiveBrowser(createIfMissing: boolean = true): Promise<BrowserSession["browser"] | null> {
    const session = await getSession(this.currentSessionId, this.config, createIfMissing);
    if (!session || !session.browser || !session.browser.isConnected()) {
      return null;
    }
    return session.browser;
  }

  async run(tool: any, args: any): Promise<CallToolResult> {
    try {
      log(`Executing tool: ${tool.schema.name} with args: ${JSON.stringify(args)}`, 'info');
      
      // Check if this tool has a handle method (new tool system)
      if ("handle" in tool && typeof tool.handle === "function") {
        const toolResult = await tool.handle(this as any, args);
        
        if (toolResult?.action) {
          const actionResult = await toolResult.action();
          const content = actionResult?.content || [];
          
          return {
            content: Array.isArray(content) ? content : [{ type: "text", text: "Action completed successfully." }],
            isError: false,
          };
        } else {
          return {
            content: [{ type: "text", text: `${tool.schema.name} completed successfully.` }],
            isError: false,
          };
        }
      } else {
        // Fallback for any legacy tools without handle method
        throw new Error(`Tool ${tool.schema.name} does not have a handle method`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Tool ${tool.schema?.name || 'unknown'} failed: ${errorMessage}`, 'error');
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  }

  /**
   * List resources
   * Documentation: https://modelcontextprotocol.io/docs/concepts/resources
   */
  listResources() {
    return listResources();
  }

  readResource(uri: string) {
    return readResource(uri);
  }

  async close() {
    try {
      // Close all Stagehand instances
      for (const [sessionId, stagehand] of this.stagehands.entries()) {
        try {
          await stagehand.close();
          log(`Closed Stagehand for session ${sessionId}`, 'info');
        } catch (error) {
          log(`Error closing Stagehand for session ${sessionId}: ${error}`, 'error');
        }
      }
      this.stagehands.clear();
      log('All Stagehand contexts closed successfully', 'info');
    } catch (error) {
      log(`Error closing Stagehand contexts: ${error}`, 'error');
    }
  }
} 