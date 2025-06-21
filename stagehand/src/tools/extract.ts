import { z } from "zod";
import type { Tool, ToolSchema, ToolResult } from "./tool.js";
import type { Context } from "../context.js";
import type { ToolActionResult } from "../context.js";

const ExtractInputSchema = z.object({
  random_string: z.string().optional().describe("Dummy parameter for no-parameter tools"),
});

type ExtractInput = z.infer<typeof ExtractInputSchema>;

const extractSchema: ToolSchema<typeof ExtractInputSchema> = {
  name: "stagehand_extract",
  description: "Extracts all of the text from the current page.",
  inputSchema: ExtractInputSchema,
};

async function handleExtract(
  context: Context,
  params: ExtractInput
): Promise<ToolResult> {
  const action = async (): Promise<ToolActionResult> => {
    try {
      const page = await context.getActivePage();
      if (!page) {
        throw new Error("No active page available");
      }

      const bodyText = await page.evaluate(() => document.body.innerText);
      const content = bodyText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => {
          if (!line) return false;

          if (
            (line.includes("{") && line.includes("}")) ||
            line.includes("@keyframes") || // Remove CSS animations
            line.match(/^\.[a-zA-Z0-9_-]+\s*{/) || // Remove CSS lines starting with .className {
            line.match(/^[a-zA-Z-]+:[a-zA-Z0-9%\s\(\)\.,-]+;$/) // Remove lines like "color: blue;" or "margin: 10px;"
          ) {
            return false;
          }
          return true;
        })
        .map((line) => {
          return line.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );
        });

      return {
        content: [
          {
            type: "text",
            text: `Extracted content:\n${content.join("\n")}`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to extract content: ${errorMsg}`);
    }
  };

  return {
    action,
    captureSnapshot: false,
    code: [],
    waitForNetwork: false,
  };
}

const extractTool: Tool<typeof ExtractInputSchema> = {
  capability: "core",
  schema: extractSchema,
  handle: handleExtract,
};

export default extractTool; 