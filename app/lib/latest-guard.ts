/** Last-call-wins guard: only the most recent next() id is considered latest. */
export function createLatestGuard(): { next(): number; isLatest(id: number): boolean } {
  let current = 0;
  return {
    next: () => ++current,
    isLatest: (id) => id === current,
  };
}
