export async function fetchPuzzle<T>(url: string, fallback?: T): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${url}`);
  return response.json();
}
