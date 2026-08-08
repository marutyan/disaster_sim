export interface SeededRngState {
  state: number;
}

export interface RandomStep {
  state: SeededRngState;
  value: number;
}

function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function createSeededRng(seed: string): SeededRngState {
  return { state: hashSeed(seed) };
}

export function nextRandom(current: SeededRngState): RandomStep {
  const nextState = (current.state + 0x6d2b79f5) >>> 0;
  let mixed = nextState;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  const output = ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;

  return {
    state: { state: nextState },
    value: output,
  };
}
