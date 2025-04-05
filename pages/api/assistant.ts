// pages/api/assistant.ts

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
// import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase"; // Optional if using types
import { cookies,headers } from "next/headers";


export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

    const cookieStore = cookies(); // ✅ sync call
    const headerStore = headers(); // ✅ sync call

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        cookies: {
          async get(name: string) {
            return (await cookies()).get(name)?.value;
          },
          set(name: string, value: string, options?: CookieOptions) {
            // You can skip actual implementation for server calls
          },
          remove(name: string, options?: CookieOptions) {
            // Same as above
          }
        }
      }
  );
  

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPro = user.app_metadata?.subscription?.status === "active";

  if (!isPro) {
    return NextResponse.json(
      {
        error: "Upgrade to Pro to use the AI Assistant.",
        code: "not_pro",
      },
      { status: 403 }
    );
  }

  const model = "gpt-3.5-turbo"; // Or "gpt-4-turbo" if preferred

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
      return NextResponse.json({ error: data }, { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content;
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("❌ Assistant error:", err);
    return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
  }
}


