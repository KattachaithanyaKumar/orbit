const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function signup(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Signup failed");
  }
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Login failed");
  }
  return res.json();
}

export interface Workspace {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  accentColor: string;
  createdAt: string;
}

export async function getWorkspaces(token: string): Promise<Workspace[]> {
  const res = await fetch(`${API_URL}/workspaces`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch workspaces");
  }
  return res.json();
}

export async function createWorkspace(
  data: { name: string; description?: string; icon?: string; accentColor?: string },
  token: string,
): Promise<Workspace> {
  const res = await fetch(`${API_URL}/workspaces`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to create workspace");
  }
  return res.json();
}

export async function deleteWorkspace(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/workspaces/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete workspace");
  }
}
