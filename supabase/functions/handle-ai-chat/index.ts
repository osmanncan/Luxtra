// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SYSTEM_PROMPT = `Sen sadece Luxtra mobil uygulamasının asistanısın. 
Kullanıcıya sadece abonelikleri, bütçesi, sorumlulukları ve kişisel finans - üretkenliği konularında yardımcı olacaksın. Eğer sana bu konular dışında bir soru gelirse, bunu nazikçe reddet ve sadece Luxtra kapsamındaki konulara cevap verebileceğini belirt. Asla diğer konulara cevap verme. Hedefin verilerini analiz eden dostane bir yaşam asistanı olmaktır. Sadece 2-3 cümle kullan.`;

serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Yetkisiz erişim (Auth eksik)" }), { status: 200, headers });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Oturum süresi dolmuş veya geçersiz." }), { status: 200, headers });
    }

    const { prompt } = await req.json();
    if (!prompt) {
       return new Response(JSON.stringify({ error: "Soru boş olamaz." }), { status: 200, headers });
    }

    // Attempt to use Google Gemini API since the Grok key was revoked/invalid.
    // Ensure you have set: npx supabase secrets set GEMINI_API_KEY=your_key
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (geminiKey) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
             contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\nKullanıcı Sorusu: " + prompt }] }],
             generationConfig: {
               temperature: 0.7,
               maxOutputTokens: 200
             }
          }),
        });

        if (response.ok) {
           const data = await response.json();
           const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
           if (replyText) return new Response(JSON.stringify({ reply: replyText.trim() }), { headers });
        }
    }

    // If Gemini fails or isn't set, try Grok (incase user sets a valid key again)
    const grokKey = Deno.env.get("GROK_API_KEY");
    if (grokKey) {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${grokKey}`
          },
          body: JSON.stringify({
             model: "grok-2-1212", 
             messages: [
               { role: "system", content: SYSTEM_PROMPT },
               { role: "user", content: prompt }
             ],
             temperature: 0.7,
          }),
        });

        if (response.ok) {
            const data = await response.json();
            const replyText = data.choices?.[0]?.message?.content?.trim();
            if (replyText) return new Response(JSON.stringify({ reply: replyText }), { headers });
        }
    }

    // Use a hard error to force the frontend to use its beautiful Local Fallback
    // instead of showing an unprofessional "busy" text.
    return new Response(JSON.stringify({ error: "API_KEY_INVALID" }), { status: 200, headers });

  } catch (error: any) {
    console.error("Function error", error);
    return new Response(JSON.stringify({ error: "NETWORK_ERROR" }), { status: 200, headers });
  }
});

