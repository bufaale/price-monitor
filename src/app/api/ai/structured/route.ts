import { generateObject } from "ai";
import { getModel } from "@/lib/ai/providers";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const analysisSchema = z.object({
  summary: z.string().describe("Brief summary of the input"),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  keyTopics: z.array(z.string()).describe("Key topics identified"),
  suggestedActions: z.array(z.string()).describe("Suggested next steps"),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { text } = await req.json();

  const { object } = await generateObject({
    model: getModel("anthropic:quality"),
    schema: analysisSchema,
    prompt: `Analyze the following text and provide structured output:\n\n${text}`,
  });

  return Response.json(object);
}
