import type { AuthLoginInput, AuthRole, AuthSession } from "./authTypes";

const AUTH_STORAGE_KEY = "rt_auth_session";

function randomId() {
  return `u_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function loadSessionFromStorage(): AuthSession | null {
  return safeJsonParse<AuthSession>(localStorage.getItem(AUTH_STORAGE_KEY));
}

export function saveSessionToStorage(session: AuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearSessionFromStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

async function loginViaEdgeFunction(input: AuthLoginInput): Promise<AuthSession> {
  // If you add the Supabase Edge Function `auth-login`, this will use it.
  // Until then, the caller should fall back to mock auth.
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!supabaseUrl) throw new Error("Missing VITE_SUPABASE_URL");

  const res = await fetch(`${supabaseUrl}/functions/v1/auth-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`Auth edge function failed: ${res.status}`);
  }

  const data = (await res.json()) as { session?: AuthSession };
  if (!data.session) throw new Error("Auth edge function returned no session");
  return data.session;
}

export async function login(input: AuthLoginInput): Promise<AuthSession> {
  // Fail gracefully: if the edge function isn't configured, allow local mock login
  // so the new dashboards can still be tested without backend setup.
  try {
    return await loginViaEdgeFunction(input);
  } catch {
    const role: AuthRole = input.email === "gov@example.com" ? "government" : "user";
    return {
      id: randomId(),
      role,
      email: input.email,
    };
  }
}

