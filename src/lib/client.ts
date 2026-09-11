import Router from 'next/router';
export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    if (response.status === 401 && !url.includes('/auth/login')) void Router.push('/login');
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return data as T;
}
export const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Quizz';
export const accent = /^#[0-9a-f]{6}$/i.test(process.env.NEXT_PUBLIC_ACCENT_COLOR || '') ? process.env.NEXT_PUBLIC_ACCENT_COLOR : '#6554c0';
