// Simple in-memory cache
const cache: Record<string, any> = {};

export function getCachedTranslation(text: string, type: string): any | null {
  const key = `${type}:${text}`;
  return cache[key] || null;
}

export function setCachedTranslation(text: string, type: string, data: any): void {
  const key = `${type}:${text}`;
  cache[key] = data;
} 