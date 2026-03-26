import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function restSelectUsers(params: { supabaseUrl: string; serviceRoleKey: string; role: string; email: string }) {
  const { supabaseUrl, serviceRoleKey, role, email } = params;
  const url =
    `${supabaseUrl}/rest/v1/users?` +
    `role=eq.${encodeURIComponent(role)}&email=eq.${encodeURIComponent(email)}` +
    `&select=id,role,email,password` +
    `&limit=1`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "count=exact",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase REST users select failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data as Array<{ id: string; role: string; email: string; password: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(
        { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars." },
        500,
      );
    }

    const body = await req.json().catch(() => null);
    const role = body?.role;
    const email = body?.email;
    const password = body?.password;

    if (!role || !email || !password) {
      return jsonResponse({ error: "Missing role/email/password." }, 400);
    }

    const users = await restSelectUsers({
      supabaseUrl: SUPABASE_URL,
      serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
      role,
      email,
    });

    if (users.length === 0) {
      return jsonResponse({ error: "Invalid credentials." }, 401);
    }

    const user = users[0];
    if (user.password !== password) {
      return jsonResponse({ error: "Invalid credentials." }, 401);
    }

    // Minimal session payload for the frontend (role-based access).
    return jsonResponse({
      session: { id: user.id, role: user.role, email: user.email },
    });
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500,
    );
  }
});

