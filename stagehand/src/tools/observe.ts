import { z } from "zod";
import type { Tool, ToolSchema, ToolResult } from "./tool.js";
import type { Context } from "../context.js";
import type { ToolActionResult } from "../context.js";

const ObserveInputSchema = z.object({
  instruction: z.string().describe(
    "Instruction for observation (e.g., 'find the login button'). This instruction must be extremely specific."
  ),
});

type ObserveInput = z.infer<typeof ObserveInputSchema>;

const observeSchema: ToolSchema<typeof ObserveInputSchema> = {
  name: "stagehand_observe",
  description:
    "Observes elements on the web page. Use this tool to observe elements that you can later use in an action. Use observe instead of extract when dealing with actionable (interactable) elements rather than text. More often than not, you'll want to use extract instead of observe when dealing with scraping or extracting structured text.",
  inputSchema: ObserveInputSchema,
};

async function handleObserve(
  context: Context,
  params: ObserveInput
): Promise<ToolResult> {
  const action = async (): Promise<ToolActionResult> => {
    try {
      const stagehand = await context.getStagehand();
      const observations = await stagehand.page.observe({
        instruction: params.instruction,
        returnAction: false,
      });

      return {
        content: [
          {
            type: "text",
            text: `Observations: ${JSON.stringify(observations)}`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to observe: ${errorMsg}`);
    }
  };

  return {
    action,
    captureSnapshot: false,
    code: [],
    waitForNetwork: false,
  };
}

const observeTool: Tool<typeof ObserveInputSchema> = {
  capability: "core",
  schema: observeSchema,
  handle: handleObserve,
};

export default observeTool; 