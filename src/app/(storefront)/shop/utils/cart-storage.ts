const CART_STORAGE_KEY = "cart";

export type CartQuantities = Record<string, number>;
export type CartEntry = { id: string; quantity: number };

function sanitizeEntry(value: unknown): CartEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as { id?: unknown; quantity?: unknown };
  if (typeof candidate.id !== "string" || !Number.isFinite(candidate.quantity)) {
    return null;
  }

  const quantity = Math.floor(Number(candidate.quantity));
  if (quantity <= 0) {
    return null;
  }

  return { id: candidate.id, quantity };
}

export function readCartEntries(): CartEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => sanitizeEntry(entry))
      .filter((entry): entry is CartEntry => entry !== null);
  } catch {
    return [];
  }
}

export function entriesToQuantities(entries: CartEntry[]): CartQuantities {
  const quantities: CartQuantities = {};

  for (const entry of entries) {
    quantities[entry.id] = entry.quantity;
  }

  return quantities;
}

export function quantitiesToEntries(quantities: CartQuantities): CartEntry[] {
  return Object.entries(quantities)
    .filter(([, rawQuantity]) => Number.isFinite(rawQuantity))
    .map(([id, rawQuantity]) => ({ id, quantity: Math.floor(rawQuantity) }))
    .filter((entry) => entry.quantity > 0);
}

export function writeCartEntries(entries: CartEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  const sanitized = entries
    .map((entry) => sanitizeEntry(entry))
    .filter((entry): entry is CartEntry => entry !== null);

  if (sanitized.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(sanitized));
}
