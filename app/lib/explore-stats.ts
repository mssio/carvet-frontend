const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export function mean(values: (number | null)[]): number | null {
  const valid = values.filter(isNum);
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
}

export function by<T>(rows: T[], key: keyof T): Map<unknown, T[]> {
  const map = new Map<unknown, T[]>();
  for (const row of rows) {
    const k = row[key];
    if (k !== null && k !== undefined && (k as unknown) !== "") {
      const group = map.get(k);
      if (group) group.push(row);
      else map.set(k, [row]);
    }
  }
  return map;
}

export function sortedNumericKeys(map: Map<unknown, unknown>): unknown[] {
  return [...map.keys()].sort((a, b) => Number(a) - Number(b));
}

export function averageFor<T>(rows: T[], field: keyof T): number | null {
  return mean(rows.map((r) => r[field] as number | null));
}

export function correlation<T>(rows: T[], xKey: keyof T, yKey: keyof T): number | null {
  const valid = rows
    .map((r) => [r[xKey], r[yKey]] as unknown as [number | null, number | null])
    .filter((p): p is [number, number] => p[0] !== null && p[1] !== null);
  if (valid.length < 2) return null;
  const mx = mean(valid.map((p) => p[0]))!;
  const my = mean(valid.map((p) => p[1]))!;
  const numerator = valid.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
  const dx = valid.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  const dy = valid.reduce((s, p) => s + (p[1] - my) ** 2, 0);
  return dx && dy ? numerator / Math.sqrt(dx * dy) : null;
}

export function linearLine(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length < 2) return [];
  const mx = mean(points.map((p) => p.x))!;
  const my = mean(points.map((p) => p.y))!;
  const denom = points.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  if (!denom) return [];
  const slope = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / denom;
  const intercept = my - slope * mx;
  const xs = [Math.min(...points.map((p) => p.x)), Math.max(...points.map((p) => p.x))];
  return xs.map((x) => ({ x, y: slope * x + intercept }));
}

const label = (v: number) =>
  v.toLocaleString("en-CA", { maximumFractionDigits: 0 });

export function histogram(values: (number | null)[], bins = 12): { labels: string[]; counts: number[] } {
  const valid = values.filter(isNum);
  if (!valid.length) return { labels: [], counts: [] };
  let min = Math.min(...valid);
  let max = Math.max(...valid);
  if (min === max) {
    min -= 0.5;
    max += 0.5;
  }
  const width = (max - min) / bins;
  const counts: number[] = Array(bins).fill(0);
  for (const v of valid) {
    counts[Math.min(bins - 1, Math.max(0, Math.floor((v - min) / width)))]++;
  }
  const labels = counts.map((_, i) => `${label(min + i * width)}–${label(min + (i + 1) * width)}`);
  return { labels, counts };
}
