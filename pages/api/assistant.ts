// pages/api/assistant.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages" });
  }

  // Create a Supabase client that can read cookies from req/res
  const supabase = createServerSupabaseClient<Database>({ req, res });
  // Retrieve the user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if user is Pro
  const user = session.user;
  const isPro = user.app_metadata?.subscription?.status === "active";
  if (!isPro) {
    return res.status(403).json({
      error: "Upgrade to Pro to use the AI Assistant.",
      code: "not_pro",
    });
  }

  // Example: call OpenAI's chat completion
  const model = "gpt-3.5-turbo";
  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("❌ OpenAI error:", data);
      return res.status(500).json({ error: data });
    }

    const reply = data.choices?.[0]?.message?.content || "No response";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Assistant error:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate response." });
  }
}




