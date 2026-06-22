---
name: typescript-engine
description: Create high-performance TypeScript engine classes with bitwise state management, typed arrays, memoization, and binary serialization. For Bun runtime.
---

# TypeScript Engine

Create optimized TypeScript engine classes following the LodgeKernel pattern: bitwise state management, typed arrays, memoization, and binary serialization.

## When to use

- User says "create engine", "build kernel", "high-performance TypeScript"
- Need bitwise state management with Uint32Array
- Need memoization caches for expensive calculations
- Need binary serialization for database storage

## Workflow

### Step 1 — Define constants and types

Create a `constants.ts` file with:
- State flags as bitwise masks: `STATE = { FLAG_A: 1 << 0, FLAG_B: 1 << 1 } as const`
- Type definitions using `typeof` for literal types
- Slot layout for binary serialization: `SLOT = { FIELD: 0, ... } as const`
- Size constants: `const BUFFER_SIZE = 1024`

```typescript
// Example pattern
export const STATE = {
  NONE: 0,
  READY: 1 << 0,  // 0x01
  ACTIVE: 1 << 1, // 0x02
  ERROR: 1 << 2,  // 0x04
} as const;

export type StateFlag = typeof STATE[keyof typeof STATE];

export const SLOT = {
  FLAGS: 0,
  DATA: 1,
  COUNTER: 2,
} as const;

export const BUFFER_SIZE = 1024;
```

### Step 2 — Create engine class

Create a `kernel.ts` file with:
- `Uint32Array` for state storage (CPU cache-friendly)
- Memoization `Map` for expensive calculations
- Bitwise operations for state management
- Binary serialization methods

```typescript
// Example pattern
export class Engine {
  private memory: Uint32Array;
  private cache: Map<string, number>;

  constructor() {
    this.memory = new Uint32Array(BUFFER_SIZE);
    this.cache = new Map();
  }

  // Bitwise state management — O(1)
  setState(flag: number): void {
    this.memory[SLOT.FLAGS] |= flag;
  }

  hasState(flag: number): boolean {
    return (this.memory[SLOT.FLAGS] & flag) === flag;
  }

  clearState(flag: number): void {
    this.memory[SLOT.FLAGS] &= ~flag;
  }

  // Memoized computation
  compute(key: string, fn: () => number): number {
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const result = fn();
    this.cache.set(key, result);
    return result;
  }

  // Binary serialization
  serialize(): Uint8Array {
    return new Uint8Array(this.memory.buffer);
  }

  deserialize(data: Uint8Array): void {
    const view = new Uint32Array(data.buffer);
    for (let i = 0; i < Math.min(view.length, BUFFER_SIZE); i++) {
      this.memory[i] = view[i];
    }
  }
}
```

### Step 3 — Create barrel export

Create `index.ts`:
```typescript
export { Engine } from './kernel';
export { STATE, SLOT, BUFFER_SIZE } from './constants';
export type { StateFlag } from './constants';
```

### Step 4 — Verify and commit

```bash
bun run lint
bun run build
git add src/engine/
git commit -m "feat: add [EngineName] with bitwise state management"
```

## Optimization patterns

- **Bitwise flags**: `|= set`, `& check`, `&= ~clear` — O(1) state transitions
- **Typed arrays**: `Uint32Array` for state, `Int32Array` for matrices, `Uint16Array` for lookup tables
- **Memoization**: `Map<string, number>` for expensive computations
- **Inline integer coercion**: `| 0` forces V8/Bun to use Smi (Small Integer) optimization
- **Pre-computed lookup tables**: `Uint16Array` indexed by character code for O(1) access

## Common pitfalls

- Don't use `require()` in ES modules — use `import`
- Don't mutate serialized data — create copies
- Don't forget to handle cache invalidation
- Don't use `any` types — use `Uint32Array`, `Int32Array`, etc.
