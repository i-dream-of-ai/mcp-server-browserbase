import { Stagehand } from "@browserbasehq/stagehand";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Config } from "../config.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { handleToolCall } from "./tools/tools.js";
import { listResources, readResource } from "./resources.js";
import { 
  ensureLogDirectory, 
  setupLogRotation, 
  registerExitHandlers, 
  scheduleLogRotation,
  setServerInstance,
  log 
} from "./logging.js";

export class Context {
  private stagehand: Stagehand;
  private server: Server;
  private config: Config;

  constructor(server: Server, config: Config) {
    this.server = server;
    this.config = config;
    
    // Initialize logging system
    setServerInstance(server);
    ensureLogDirectory();
    setupLogRotation();
    registerExitHandlers();
    scheduleLogRotation();

    // Initialize Stagehand
    this.stagehand = new Stagehand({
      env: "BROWSERBASE",
      logger: (logLine) => {
        log(`Stagehand: ${logLine.message}`, 'info');
      },
    });
  }

  async run(tool: any, args: any): Promise<CallToolResult> {
    try {
      log(`Executing tool: ${tool.name} with args: ${JSON.stringify(args)}`, 'info');
      const result = await handleToolCall(tool.name, args, this.stagehand);
      log(`Tool ${tool.name} completed successfully`, 'info');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Tool ${tool.name} failed: ${errorMessage}`, 'error');
      throw error;
    }
  }

  listResources() {
    return listResources();
  }

  readResource(uri: string) {
    return readResource(uri);
  }

  async close() {
    try {
      await this.stagehand.close();
      log('Stagehand context closed successfully', 'info');
    } catch (error) {
      log(`Error closing Stagehand context: ${error}`, 'error');
    }
  }
} 