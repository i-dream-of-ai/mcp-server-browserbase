import { z } from "zod";
import { defineTool, type Tool, type ToolResult, type InputType } from "./tool.js";
import * as stagehandStore from "../stagehandStore.js";
import { CreateSessionParams } from "../types/types.js";
import type { Context } from "../context.js";
import navigateTool from "./navigate.js";
import actTool from "./act.js";
import extractTool from "./extract.js";
import observeTool from "./observe.js";

/**
 * Creates a session-aware version of an existing tool
 * This wraps the original tool's handler to work with a specific session
 */
function createMultiSessionAwareTool<TInput extends InputType>(
  originalTool: Tool<TInput>,
  options: {
    namePrefix?: string;
    nameSuffix?: string;
  } = {}
): Tool<InputType> {
  const { namePrefix = "", nameSuffix = "_session" } = options;
  
  // Create new input schema that includes sessionId
  const originalSchema = originalTool.schema.inputSchema;
  let newInputSchema: z.ZodSchema;
  
  if (originalSchema instanceof z.ZodObject) {
    // If it's a ZodObject, we can spread its shape
    newInputSchema = z.object({
      sessionId: z.string().describe("The session ID to use"),
      ...originalSchema.shape,
    });
  } else {
    // For other schema types, create an intersection
    newInputSchema = z.intersection(
      z.object({ sessionId: z.string().describe("The session ID to use") }),
      originalSchema
    );
  }

  return defineTool({
    capability: originalTool.capability,
    schema: {
      name: `${namePrefix}${originalTool.schema.name}${nameSuffix}`,
      description: `${originalTool.schema.description} (for a specific session)`,
      inputSchema: newInputSchema,
    },
    handle: async (context: Context, params: any): Promise<ToolResult> => {
      const { sessionId, ...originalParams } = params;
      
      // Get the session
      const session = stagehandStore.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }
      
      // Create a temporary context that points to the specific session
      const sessionContext = Object.create(context);
      sessionContext.currentSessionId = session.metadata?.bbSessionId || sessionId;
      sessionContext.getStagehand = async () => session.stagehand;
      sessionContext.getActivePage = async () => session.page;
      sessionContext.getActiveBrowser = async () => session.browser;
      
      // Call the original tool's handler with the session-specific context
      return originalTool.handle(sessionContext, originalParams);
    },
  });
}

// Create session tool
export const createSessionTool = defineTool({
  capability: "create_session",
  schema: {
    name: "stagehand_session_create_multi",
    description: "Create a new Stagehand browser session. Returns the session ID.",
    inputSchema: z.object({
      name: z.string().optional().describe("Optional name for the session"),
      browserbaseSessionID: z.string().optional().describe("Resume an existing Browserbase session"),
      browserbaseSessionCreateParams: z.any().optional().describe("Custom Browserbase session parameters"),
    }),
  },
  handle: async (context: Context, { name, browserbaseSessionID, browserbaseSessionCreateParams }): Promise<ToolResult> => {
    try {
      const params: CreateSessionParams = {
        browserbaseSessionID,
        browserbaseSessionCreateParams,
        meta: name ? { name } : undefined,
      };
      
      const session = await stagehandStore.create(context.config, params);
      
      return {
        action: async () => ({
          content: [
            {
              type: "text",
              text: `Created session ${session.id}${name ? ` (${name})` : ''}\nBrowserbase session: ${session.metadata?.bbSessionId}`,
            },
          ],
        }),
        waitForNetwork: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create session: ${errorMessage}`);
    }
  },
});

// List sessions tool
export const listSessionsTool = defineTool({
  capability: "list_sessions",
  schema: {
    name: "stagehand_session_list",
    description: "List all active Stagehand browser sessions",
    inputSchema: z.object({}),
  },
  handle: async (): Promise<ToolResult> => {
    const sessions = stagehandStore.list();
    
    if (sessions.length === 0) {
      return {
        action: async () => ({
          content: [
            {
              type: "text",
              text: "No active sessions",
            },
          ],
        }),
        waitForNetwork: false,
      };
    }
    
    const sessionInfo = sessions.map(s => ({
      id: s.id,
      name: s.metadata?.name,
      browserbaseSessionId: s.metadata?.bbSessionId,
      created: new Date(s.created).toISOString(),
      age: Math.floor((Date.now() - s.created) / 1000),
    }));
    
    return {
      action: async () => ({
        content: [
          {
            type: "text",
            text: `Active sessions (${sessions.length}):\n${sessionInfo
              .map(s => `- ${s.id}${s.name ? ` (${s.name})` : ''} - BB: ${s.browserbaseSessionId} - Age: ${s.age}s`)
              .join('\n')}`,
          },
        ],
      }),
      waitForNetwork: false,
    };
  },
});

// Close session tool
export const closeSessionTool = defineTool({
  capability: "close_session",
  schema: {
    name: "stagehand_session_close_multi",
    description: "Close a specific Stagehand browser session",
    inputSchema: z.object({
      sessionId: z.string().describe("The session ID to close"),
    }),
  },
  handle: async (_context: Context, { sessionId }): Promise<ToolResult> => {
    const session = stagehandStore.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    await stagehandStore.remove(sessionId);
    
    return {
      action: async () => ({
        content: [
          {
            type: "text",
            text: `Closed session ${sessionId}`,
          },
        ],
      }),
      waitForNetwork: false,
    };
  },
});

// Create multi-session-aware versions of the core tools
export const navigateWithSessionTool = createMultiSessionAwareTool(navigateTool, {
  namePrefix: "multi-",
  nameSuffix: "_session",
});

export const actWithSessionTool = createMultiSessionAwareTool(actTool, {
  namePrefix: "multi-",
  nameSuffix: "_session",
});

export const extractWithSessionTool = createMultiSessionAwareTool(extractTool, {
  namePrefix: "multi-",
  nameSuffix: "_session",
});

export const observeWithSessionTool = createMultiSessionAwareTool(observeTool, {
  namePrefix: "multi-",
  nameSuffix: "_session",
}); 