import { apiRequest } from "./queryClient";
import type { LinkSessionRequest, UpdateSessionRequest, AdminLoginRequest, LinkSessionResponse } from "@shared/schema";

export async function linkSession(data: LinkSessionRequest): Promise<LinkSessionResponse> {
  const response = await fetch('/api/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to link session');
  }

  return response.json();
}

export async function checkSessionStatus(sessionId: string) {
  const response = await fetch(`/api/session-status/${sessionId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to check session status');
  }

  return response.json();
}

export async function getSession(sessionId: string) {
  const response = await apiRequest("GET", `/api/session/${sessionId}`);
  return response.json();
}

export async function updateSession(sessionId: string, data: UpdateSessionRequest) {
  const response = await apiRequest("PUT", `/api/session/${sessionId}`, data);
  return response.json();
}

export async function adminLogin(data: AdminLoginRequest) {
  const response = await apiRequest("POST", "/api/admin/login", data);
  return response.json();
}

export async function getAllSessions() {
  const response = await apiRequest("GET", "/api/admin/sessions");
  return response.json();
}

export async function deleteSession(sessionId: string) {
  const response = await apiRequest("DELETE", `/api/admin/sessions/${sessionId}`);
  return response.json();
}

export async function getBotSettings(sessionId: string) {
  const response = await apiRequest("GET", `/api/bot-settings/${sessionId}`);
  return response.json();
}

export async function updateBotSettings(sessionId: string, data: any) {
  const response = await apiRequest("PUT", `/api/bot-settings/${sessionId}`, data);
  return response.json();
}

export async function getAdminSettings() {
  const response = await apiRequest("GET", "/api/admin/settings");
  return response.json();
}

export async function updateAdminSettings(data: any) {
  const response = await apiRequest("PUT", "/api/admin/settings", data);
  return response.json();
}