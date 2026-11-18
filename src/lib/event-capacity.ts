export function parseEventCapacity(value: string): number | null {
  if (!value.trim()) return null;
  const capacity = Number(value);
  if (!Number.isSafeInteger(capacity) || capacity <= 0) throw new Error("Invalid capacity");
  return capacity;
}