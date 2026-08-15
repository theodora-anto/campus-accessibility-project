const BASE_URL = import.meta.env.VITE_API_BASE_URL

export function getImageUrl(filePath: string): string {
  return `${BASE_URL}${filePath}`
}
