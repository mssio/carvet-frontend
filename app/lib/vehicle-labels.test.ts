import { describe, expect, it } from "vitest";
import { carImage, fuelLabel, transLabel } from "./vehicle-labels";

describe("vehicle labels", () => {
  it("labels transmissions", () => {
    expect(transLabel("AS8")).toBe("Auto (select shift) 8-spd");
    expect(transLabel("AV")).toBe("CVT");
    expect(transLabel("M6")).toBe("Manual 6-spd");
    expect(transLabel("A10")).toBe("Automatic 10-spd");
  });
  it("labels fuels", () => {
    expect(fuelLabel("Z")).toBe("Premium gasoline");
    expect(fuelLabel("Q")).toBe("Q");
  });
  it("maps class to image", () => {
    expect(carImage("Pickup truck: Standard")).toBe("/img/car-pickup.svg");
    expect(carImage("Sport utility vehicle: Small")).toBe("/img/car-suv.svg");
    expect(carImage("Minivan")).toBe("/img/car-van.svg");
    expect(carImage("Mid-size")).toBe("/img/car-sedan.svg");
  });
});
