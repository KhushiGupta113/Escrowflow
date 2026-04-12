const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {})
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include"
  });
  
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message ?? "Request failed");
  return payload.data as T;
}
