import { iota, range } from "./range";

describe("range", () => {
  it("should works correctly", () => {
    expect([...range(0, 10, 2)]).toEqual([0, 2, 4, 6, 8]);
    expect([...range(-2, 5, 3)]).toEqual([-2, 1, 4]);
    expect([...range(2, 7)]).toEqual([2, 3, 4, 5, 6]);
    range(0.2, -1, -0.4).forEach((v, i) =>
      expect(v).toBeCloseTo([0.2, -0.2, -0.6][i])
    );
    expect([...range(2, 2, 5)]).toEqual([]);
  });

  it("should be failed", () => {
    expect(() => [...range(1, 0, 2)]).toThrow();
    expect(() => [...range(1, 3, -2)]).toThrow();
    expect(() => [...range(-1, -3, 2)]).toThrow();
  });
});

describe("iota", () => {
  it("should works correctly", () => {
    expect([...iota(4)]).toEqual([0, 1, 2, 3]);
    expect([...iota(2.1)]).toEqual([0, 1, 2]);
    expect([...iota(0)]).toEqual([]);
  });

  it("should be failed", () => {
    expect(() => [...iota(-1)]).toThrow();
  });
});
