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
  data: {
    name: string;
    description?: string;
    icon?: string;
    accentColor?: string;
  },
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

export async function deleteWorkspace(
  id: number,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/workspaces/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete workspace");
  }
}

export interface Folder {
  id: number;
  name: string;
  icon: string;
  position: number;
  createdAt: string;
}

export async function getFolders(
  workspaceId: number,
  token: string,
): Promise<Folder[]> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/folders`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch folders");
  }
  return res.json();
}

export async function createFolder(
  workspaceId: number,
  data: { name: string; icon?: string },
  token: string,
): Promise<Folder> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/folders`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to create folder");
  }
  return res.json();
}

export async function deleteFolder(
  workspaceId: number,
  folderId: number,
  token: string,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/workspaces/${workspaceId}/folders/${folderId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete folder");
  }
}

export interface FileItem {
  id: number;
  name: string;
  content: unknown | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export async function getFiles(
  workspaceId: number,
  folderId: number,
  token: string,
): Promise<FileItem[]> {
  const res = await fetch(
    `${API_URL}/workspaces/${workspaceId}/folders/${folderId}/files`,
    { headers: authHeaders(token) },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch files");
  }
  return res.json();
}

export async function createFile(
  workspaceId: number,
  folderId: number,
  data: { name: string },
  token: string,
): Promise<FileItem> {
  const res = await fetch(
    `${API_URL}/workspaces/${workspaceId}/folders/${folderId}/files`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to create file");
  }
  return res.json();
}

export async function getFile(
  workspaceId: number,
  folderId: number,
  fileId: number,
  token: string,
): Promise<FileItem> {
  const res = await fetch(
    `${API_URL}/workspaces/${workspaceId}/folders/${folderId}/files/${fileId}`,
    { headers: authHeaders(token) },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to fetch file");
  }
  return res.json();
}

export async function updateFile(
  workspaceId: number,
  folderId: number,
  fileId: number,
  data: { name?: string; content?: unknown },
  token: string,
): Promise<FileItem> {
  const res = await fetch(
    `${API_URL}/workspaces/${workspaceId}/folders/${folderId}/files/${fileId}`,
    {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to update file");
  }
  return res.json();
}

export async function deleteFile(
  workspaceId: number,
  folderId: number,
  fileId: number,
  token: string,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/workspaces/${workspaceId}/folders/${folderId}/files/${fileId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete file");
  }
}
