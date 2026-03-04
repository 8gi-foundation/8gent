import { z } from "zod";

// Tool categories - simple and consumer-friendly
export const ToolCategory = z.enum([
  "productivity",
  "communication",
  "media",
  "dev",
  "other"
]);

// Tool types
export const ToolType = z.enum([
  "builtin",    // Ships with 8gent
  "community",  // User-contributed
  "custom"      // User-created
]);

// Main tool schema - kept simple for consumers
export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: ToolType,
  category: ToolCategory,
  inputSchema: z.record(z.any()),
  enabled: z.boolean().default(true),
});

// For creating new tools
export const CreateToolSchema = ToolSchema.omit({ id: true });

// For invoking tools
export const InvokeRequestSchema = z.object({
  input: z.record(z.any()),
  userId: z.string().optional(),
});

// Query request
export const QueryRequestSchema = z.object({
  task: z.string(),
  category: ToolCategory.optional(),
});

// Types
export type Tool = z.infer<typeof ToolSchema>;
export type CreateTool = z.infer<typeof CreateToolSchema>;
export type InvokeRequest = z.infer<typeof InvokeRequestSchema>;
export type QueryRequest = z.infer<typeof QueryRequestSchema>;
export type ToolCategory = z.infer<typeof ToolCategory>;
export type ToolType = z.infer<typeof ToolType>;
