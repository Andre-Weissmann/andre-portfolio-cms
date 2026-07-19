// Simple admin auth — token stored in memory.
// When arriving from the secret-knock overlay on the public page,
// the token is pre-seeded into sessionStorage so we pick it up here.
let adminToken: string | null = null;

// On module load, check sessionStorage (set by secret-knock flow)
try {
  const stored = sessionStorage.getItem('admin_token');
  if (stored) {
    adminToken = stored;
    sessionStorage.removeItem('admin_token'); // consume once
  }
} catch {}

export function setAdminToken(token: string) {
  adminToken = token;
}

export function getAdminToken(): string | null {
  return adminToken;
}

export function clearAdminToken() {
  adminToken = null;
}

export function isAdmin(): boolean {
  return adminToken !== null;
}

export function adminHeaders(): Record<string, string> {
  if (!adminToken) return {};
  return { "x-admin-token": adminToken };
}
