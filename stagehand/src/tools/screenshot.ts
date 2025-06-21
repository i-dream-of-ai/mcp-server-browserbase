import { z } from "zod";
import type { Tool, ToolSchema, ToolResult } from "./tool.js";
import type { Context } from "../context.js";
import type { ToolActionResult } from "../context.js";
import { getServerInstance } from "../logging.js";
import { screenshots } from "../resources.js";

const ScreenshotInputSchema = z.object({
  random_string: z.string().optional().describe("Dummy parameter for no-parameter tools"),
});

type ScreenshotInput = z.infer<typeof ScreenshotInputSchema>;

const screenshotSchema: ToolSchema<typeof ScreenshotInputSchema> = {
  name: "screenshot",
  description:
    "Takes a screenshot of the current page. Use this tool to learn where you are on the page when controlling the browser with Stagehand. Only use this tool when the other tools are not sufficient to get the information you need.",
  inputSchema: ScreenshotInputSchema,
};

async function handleScreenshot(
  context: Context,
  params: ScreenshotInput
): Promise<ToolResult> {
  const action = async (): Promise<ToolActionResult> => {
    try {
      const page = await context.getActivePage();
      if (!page) {
        throw new Error("No active page available");
      }

      const screenshotBuffer = await page.screenshot({
        fullPage: false,
      });

      // Convert buffer to base64 string and store in memory
      const screenshotBase64 = screenshotBuffer.toString("base64");
      const name = `screenshot-${new Date()
        .toISOString()
        .replace(/:/g, "-")}`;
      screenshots.set(name, screenshotBase64);

      // Notify the client that the resources changed
      const serverInstance = getServerInstance();
      if (serverInstance) {
        serverInstance.notification({
          method: "notifications/resources/list_changed",
        });
      }

      return {
        content: [
          {
            type: "text",
            text: `Screenshot taken with name: ${name}`,
          },
          {
            type: "image",
            data: screenshotBase64,
            mimeType: "image/png",
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to take screenshot: ${errorMsg}`);
    }
  };

  return {
    action,
    captureSnapshot: false,
    code: [],
    waitForNetwork: false,
  };
}

const screenshotTool: Tool<typeof ScreenshotInputSchema> = {
  capability: "core",
  schema: screenshotSchema,
  handle: handleScreenshot,
};

export default screenshotTool; 