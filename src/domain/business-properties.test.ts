import { describe, expect, it } from "vitest";
import { baseInputs, calculateBusiness } from "./business";
describe("financial cross-checks across assumptions", () => {
  it("is monotonic in recovery share with fixed costs", () => {
    let previous = -Infinity;
    for (let percent = 0; percent <= 100; percent++) {
      const r = calculateBusiness({
        ...baseInputs,
        recoveryShare: percent / 100,
      });
      expect(r.monthlyNet).toBeGreaterThanOrEqual(previous - 1e-8);
      expect(r.potentialCompleted).toBeLessThanOrEqual(r.attempts + 1e-8);
      previous = r.monthlyNet;
    }
  });
  it("charges fee per device but total opex only once", () => {
    const base = calculateBusiness(baseInputs),
      fee = calculateBusiness({
        ...baseInputs,
        monthlyFee: baseInputs.monthlyFee + 1000,
      }),
      opex = calculateBusiness({
        ...baseInputs,
        maintenanceTotal: baseInputs.maintenanceTotal + 1000,
      });
    expect(base.monthlyNet - fee.monthlyNet).toBe(baseInputs.devices * 1000);
    expect(base.monthlyNet - opex.monthlyNet).toBe(1000);
  });
  it("does not multiply total upfront integration cost by devices", () => {
    const r = calculateBusiness({ ...baseInputs, devices: 20 });
    expect(r.paybackMonths).toBeCloseTo(baseInputs.setupTotal / r.monthlyNet);
    expect(r.annualNetAfterSetup).toBe(
      r.monthlyNet * 12 - baseInputs.setupTotal,
    );
  });
  it("preserves before-after equality across the bounded rate grid", () => {
    for (const abandonRate of [0, 0.1, 0.5, 1])
      for (const recoveryShare of [0, 0.2, 1])
        for (const staffReduction of [0, 0.2, 1]) {
          const r = calculateBusiness({
            ...baseInputs,
            abandonRate,
            recoveryShare,
            staffReduction,
          });
          expect(r.afterProfit - r.beforeProfit).toBeCloseTo(r.monthlyNet, 6);
        }
  });
});
