import type { VehicleRecord } from "./types";

export const MAX_CARS = 4;

export function compareAddState(
  selected: VehicleRecord[],
  current: VehicleRecord | null,
): { disabled: boolean; note: string | null } {
  if (selected.length >= MAX_CARS) {
    return { disabled: true, note: `You can compare up to ${MAX_CARS} cars. Remove one to add another.` };
  }
  if (!current) return { disabled: true, note: null };
  if (selected.includes(current)) {
    return { disabled: true, note: "This car is already added — pick a different model or version." };
  }
  return { disabled: false, note: null };
}
