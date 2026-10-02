// Small shared helpers used by the header and stat cards.
export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
