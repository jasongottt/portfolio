import { describe, expect, it } from "vitest";
import { MAX_SKIPS, SWEEP_MS, SWEET, flightPlan, meterAt, skipsFor } from "./skipStones";

describe("meterAt", () => {
  it("sweeps across and back", () => {
    expect(meterAt(0)).toBe(0);
    expect(meterAt(SWEEP_MS / 2)).toBeCloseTo(0.5);
    expect(meterAt(SWEEP_MS)).toBeCloseTo(1);
    expect(meterAt(SWEEP_MS * 1.5)).toBeCloseTo(0.5);
    expect(meterAt(SWEEP_MS * 2)).toBeCloseTo(0);
    expect(meterAt(SWEEP_MS * 2.25)).toBeCloseTo(meterAt(SWEEP_MS * 0.25));
  });
});

describe("skipsFor", () => {
  it("skips most from the middle", () => {
    expect(skipsFor(0.5, 0.5)).toBe(MAX_SKIPS);
    expect(skipsFor(0.5, 0)).toBe(MAX_SKIPS - 1);
  });

  it("does well anywhere in the sweet spot", () => {
    expect(skipsFor(0.5 + SWEET, 0.5)).toBeGreaterThanOrEqual(8);
    expect(skipsFor(0.5 - SWEET, 0.5)).toBeGreaterThanOrEqual(8);
  });

  it("skips fewer the further off the middle", () => {
    let last = Infinity;
    for (let meter = 0.5; meter >= 0; meter -= 0.05) {
      const skips = skipsFor(meter, 0.5);
      expect(skips).toBeLessThanOrEqual(last);
      last = skips;
    }
  });

  it("just sinks out at the ends", () => {
    expect(skipsFor(0, 1)).toBe(0);
    expect(skipsFor(1, 1)).toBe(0);
  });
});

describe("flightPlan", () => {
  const sea = () => true;
  const hand = [0, 1, 0];
  const north = [0, -1];

  it("touches the water once per skip, then sinks", () => {
    const plan = flightPlan(hand, north, 5, sea);
    expect(plan.hops).toHaveLength(6);
    expect(plan).toMatchObject({ skips: 5, ashore: false });
    expect(plan.hops.every((hop) => hop.wet)).toBe(true);
  });

  it("sinks at once with no skips", () => {
    const plan = flightPlan(hand, north, 0, sea);
    expect(plan.hops).toHaveLength(1);
    expect(plan.skips).toBe(0);
  });

  it("hops shorter, lower and along the heading", () => {
    const { hops } = flightPlan(hand, north, 4, sea);
    for (let i = 1; i < hops.length; i++) {
      const length = (hop) => Math.hypot(hop.to[0] - hop.from[0], hop.to[1] - hop.from[2]);
      expect(length(hops[i])).toBeLessThan(length(hops[i - 1]));
      expect(hops[i].lift).toBeLessThan(hops[i - 1].lift);
      expect(hops[i].to[0]).toBe(0);
      expect(hops[i].to[1]).toBeLessThan(hops[i - 1].to[1]);
    }
  });

  it("comes ashore on land, counting the skips it made", () => {
    const pond = (x, z) => z > -5;
    const plan = flightPlan(hand, north, MAX_SKIPS, pond);
    expect(plan.ashore).toBe(true);
    expect(plan.hops.at(-1).wet).toBe(false);
    expect(plan.skips).toBe(plan.hops.length - 1);
    expect(plan.skips).toBeLessThan(MAX_SKIPS);
  });
});
