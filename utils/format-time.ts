/**
 * Formate un nombre de secondes en HH:MM
 * @param seconds - Nombre de secondes
 * @returns String au format "MM:SS"
 * @example
 * formatTime(65) // "01:05"
 * formatTime(3661) // "61:01"
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${secs}`;
}
