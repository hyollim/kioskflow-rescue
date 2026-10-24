import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRescue } from "./useRescue";
import type { KioskEvent } from "../domain/events";
describe("real timer scheduling under a deterministic clock", () => {
  it("offers only after idle threshold and enforces maximum two offers", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    try {
      const events: KioskEvent[] = [];
      const { result, unmount } = renderHook(() =>
        useRescue("C", (e) => events.push(e)),
      );
      act(() => {
        result.current.begin();
        result.current.enter("options");
        result.current.record("invalid_action");
        result.current.record("invalid_action");
      });
      act(() => vi.advanceTimersByTime(19_000));
      expect(result.current.help).toBeNull();
      act(() => vi.advanceTimersByTime(1_000));
      expect(result.current.help?.stage).toBe("offer");
      act(() => {
        result.current.accept();
        result.current.close();
      });
      act(() => vi.advanceTimersByTime(30_000));
      expect(events.filter((e) => e.name === "help_offered")).toHaveLength(2);
      act(() => {
        result.current.accept();
        result.current.close();
      });
      act(() => vi.advanceTimersByTime(90_000));
      expect(events.filter((e) => e.name === "help_offered")).toHaveLength(2);
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
