import { QueryClient } from "@tanstack/react-query";
import { adminHeaders } from "./auth";

// deploy_website rewrites "__PORT_5000__" → "/port/5000" in the built JS.
// In local dev the startsWith("__") check evaluates to true → empty string (relative URLs).
const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "/" + "__PORT_5000__";

export async function apiRequest(method: string, path: string, body?: unknown): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...adminHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const path = queryKey[0] as string;
        const res = await fetch(`${API_BASE}${path}`, {
          headers: adminHeaders(),
        });
        if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
        return res.json();
      },
      staleTime: 30_000,
      retry: 1,
    },
  },
});
