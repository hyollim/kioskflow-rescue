import { describe, expect, it } from "vitest";
import { computeKpis, formatRate, summarizeSessions } from "./analytics";
import { createSyntheticEvents } from "./synthetic";
import type { KioskEvent } from "./events";
const e = (
  name: KioskEvent["name"],
  at: number,
  extra: Partial<KioskEvent> = {},
): KioskEvent => ({
  id: crypto.randomUUID(),
  sessionId: "s",
  mode: "C",
  source: "live",
  name,
  step: "options",
  at,
  ...extra,
});
describe("KPI definitions and complete synthetic fixture", () => {
  it("uses null, not zero performance, for empty denominators", () => {
    const k = computeKpis([]);
    expect(k.started).toBe(0);
    expect(k.completionRate).toBeNull();
    expect(k.averageCompletionSeconds).toBeNull();
    expect(k.acceptanceRate).toBeNull();
    expect(formatRate(null)).toBe("—");
  });
  it("keeps open sessions out of terminal rates and durations", () => {
    const k = computeKpis([e("session_started", 0)]);
    expect(k.open).toBe(1);
    expect(k.ended).toBe(0);
    expect(k.completionRate).toBeNull();
  });
  it("exactly calculates all 12 predetermined sessions without causal claims", () => {
    const k = computeKpis(createSyntheticEvents());
    expect(k.started).toBe(12);
    expect(k.completed).toBe(9);
    expect(k.abandoned).toBe(3);
    expect(k.completionRate).toBe(0.75);
    expect(k.abandonmentRate).toBe(0.25);
    expect(k.averageCompletionSeconds).toBeCloseTo(860 / 9);
    expect(k.offers).toBe(3);
    expect(k.accepted).toBe(1);
    expect(k.dismissed).toBe(2);
    expect(k.unanswered).toBe(0);
    expect(k.acceptanceRate).toBeCloseTo(1 / 3);
    expect(k.dismissalRate).toBeCloseTo(2 / 3);
    expect(k.afterHelpCompletionRate).toBeCloseTo(2 / 3);
    expect(k.unnecessaryProxyRate).toBe(0.5);
    expect(k.helpRequestRate).toBeCloseTo(2 / 12);
    expect(k.autoOfferRate).toBe(0.25);
    expect(k.staffRequestRate).toBeCloseTo(1 / 12);
  });
  it("has the same completion rate in A/B/C synthetic cohorts", () => {
    const events = createSyntheticEvents();
    for (const mode of ["A", "B", "C"])
      expect(
        computeKpis(events.filter((e) => e.mode === mode)).completionRate,
      ).toBe(0.75);
  });
  it("deduplicates event IDs and ignores orphan events", () => {
    const start = e("session_started", 0),
      end = e("order_completed", 10_000);
    const k = computeKpis([
      start,
      start,
      end,
      end,
      e("order_completed", 20_000, { sessionId: "orphan" }),
    ]);
    expect(k.started).toBe(1);
    expect(k.completed).toBe(1);
    expect(k.averageCompletionSeconds).toBe(10);
  });
  it("only uses the first terminal event, even at equal timestamps", () => {
    const events = [
      e("session_started", 0),
      e("order_completed", 5000),
      e("help_requested", 5000),
      e("session_abandoned", 6000),
    ];
    const k = computeKpis(events);
    expect(k.completed).toBe(1);
    expect(k.abandoned).toBe(0);
    expect(k.afterHelpCompletionRate).toBeNull();
    expect(summarizeSessions(events)[0].events).toHaveLength(2);
  });
  it("counts only the first response of a valid offered ID", () => {
    const k = computeKpis([
      e("session_started", 0),
      e("help_offered", 1, { offerId: "o" }),
      e("help_accepted", 2, { offerId: "o" }),
      e("help_dismissed", 3, { offerId: "o" }),
      e("help_accepted", 4, { offerId: "orphan" }),
    ]);
    expect(k.offers).toBe(1);
    expect(k.accepted).toBe(1);
    expect(k.dismissed).toBe(0);
  });
  it("does not count manual help after rejection as self-completion proxy", () => {
    const k = computeKpis([
      e("session_started", 0),
      e("help_offered", 1000, { offerId: "o" }),
      e("help_dismissed", 2000, { offerId: "o" }),
      e("help_requested", 3000),
      e("order_completed", 10_000),
    ]);
    expect(k.proxyEligible).toBe(1);
    expect(k.proxy).toBe(0);
    expect(k.unnecessaryProxyRate).toBe(0);
  });
  it("includes exactly 30 seconds but excludes slower completion in the proxy", () => {
    for (const delta of [30_000, 30_001]) {
      const k = computeKpis([
        e("session_started", 0),
        e("help_offered", 1000, { offerId: "o" }),
        e("help_dismissed", 2000, { offerId: "o" }),
        e("order_completed", 2000 + delta),
      ]);
      expect(k.proxy).toBe(delta === 30_000 ? 1 : 0);
    }
  });
  it("does not use unfinished dismissed sessions in proxy denominator", () => {
    const k = computeKpis([
      e("session_started", 0),
      e("help_offered", 1, { offerId: "o" }),
      e("help_dismissed", 2, { offerId: "o" }),
    ]);
    expect(k.proxyEligible).toBe(0);
    expect(k.unnecessaryProxyRate).toBeNull();
  });
  it("ignores cross-mode/source corruption within a session", () =>
    expect(
      computeKpis([
        e("session_started", 0),
        e("order_completed", 1000, { mode: "A" }),
        e("order_completed", 2000, { source: "synthetic" }),
      ]).open,
    ).toBe(1));
});
