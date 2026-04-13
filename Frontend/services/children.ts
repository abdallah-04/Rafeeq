/**
 * services/children.ts
 *
 * Typed mock service for child management.
 * All functions return Promises and wrap calls in try/catch so the real
 * backend can be swapped in by replacing the internals without touching
 * the callers.
 */

export type Child = {
  id: string;
  fullName: string;
  age: number;
  avatarUrl?: string;
  /** 0–100 */
  progress: number;
  gender: 'male' | 'female';
  schoolName?: string;
  /** difficulty/condition e.g. 'ADHD', 'ASD' */
  caseType?: string;
  /** ISO date string */
  dateOfBirth: string;
};

// ─── helpers ────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let _nextId = 1;
function generateId(): string {
  return `child_${Date.now()}_${_nextId++}`;
}

// ─── in-memory store (simulates backend state) ───────────────────────────────
// Starts empty so a fresh login lands on the empty state.

let _store: Child[] = [];

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Fetch all children for the currently authenticated parent.
 */
export async function listChildren(): Promise<Child[]> {
  try {
    await delay(300);
    return [..._store];
  } catch (err) {
    throw err;
  }
}

/**
 * Add a new child and return the created record (with generated id).
 */
export async function addChild(
  data: Omit<Child, 'id'>
): Promise<Child> {
  try {
    await delay(600);
    const child: Child = { ...data, id: generateId() };
    _store = [..._store, child];
    return child;
  } catch (err) {
    throw err;
  }
}

/**
 * Fetch a single child by id. Returns null if not found.
 */
export async function getChild(id: string): Promise<Child | null> {
  try {
    await delay(200);
    return _store.find((c) => c.id === id) ?? null;
  } catch (err) {
    throw err;
  }
}
