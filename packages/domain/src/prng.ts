function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export class DeterministicRng {
  private state: number;

  constructor(seed: string) {
    this.state = hashSeed(seed) || 0x6d2b79f5;
  }

  nextUint32(): number {
    let value = (this.state += 0x6d2b79f5) >>> 0;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    value = (value ^ (value >>> 14)) >>> 0;
    this.state = this.state >>> 0;
    return value;
  }

  nextFloat(): number {
    return this.nextUint32() / 0x1_0000_0000;
  }
}
