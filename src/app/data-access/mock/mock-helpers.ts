export function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export async function mockDelay(ms = 180): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockId(prefix: string): string {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

  return `${prefix}_${randomPart}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
