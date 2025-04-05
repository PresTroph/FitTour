// pages/api/tts-elevenlabs.ts

import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    // Collect raw request body (since bodyParser is disabled)
    const buffers: Uint8Array[] = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString("utf-8");
    const { text } = JSON.parse(rawBody);

    if (!text) {
      return res.status(400).json({ error: "Missing text input" });
    }

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    // Call ElevenLabs API to generate TTS streaming response
    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: "POST",
      headers: {
        "xi-api-key": elevenlabsApiKey || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!elevenRes.ok) {
      const errorText = await elevenRes.text();
      console.error("❌ ElevenLabs streaming error:", errorText);
      return res.status(500).json({ error: "Streaming failed", details: errorText });
    }

    // Set response headers for audio stream
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    // Stream the response from ElevenLabs directly to the client
    if (elevenRes.body) {
      const reader = elevenRes.body.getReader();

      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };

      await pump();
    } else {
      res.status(500).json({ error: "No response body from ElevenLabs" });
    }
  } catch (err) {
    console.error("❌ Streaming error:", err);
    res.status(500).json({ error: "Unexpected error occurred" });
  }
}
