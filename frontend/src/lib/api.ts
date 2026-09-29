import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  token: string;
};

export async function apiFetch(path: string, options: ApiFetchOptions) {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.token}`,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  return response.json();
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
