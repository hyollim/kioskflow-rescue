import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { renderHook } from "@testing-library/react";
import { useEventStore } from "../hooks/useEventStore";
import { EVENT_STORAGE_KEY } from "../domain/storage";
import type { KioskEvent } from "../domain/events";
describe("analysis workspaces and persistence", () => {
  it("keeps live data empty and displays synthetic data only when selected", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "운영 대시보드" }));
    expect(screen.getByText("표시할 세션이 없습니다.")).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: "가상 비교 데이터" }));
    expect(screen.getByText(/사전 정의한 12개 합성 세션/)).toBeInTheDocument();
    expect(screen.getAllByText("75.0%")).toHaveLength(4);
    expect(screen.getByText("12건")).toBeInTheDocument();
  });
  it("changes the recommendation from profitable pilot to negative hold", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "사업성 분석" }));
    expect(
      screen.getByRole("heading", { name: "소규모 실증 권고" }),
    ).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: /부정적 가정/ }));
    expect(
      screen.getByRole("heading", { name: "도입 보류" }),
    ).toBeInTheDocument();
    expect(screen.getByText("회수 불가")).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: /기준 가정/ }));
    const field = screen.getByRole("spinbutton", {
      name: /기기당 월 솔루션 이용료/,
    });
    await u.clear(field);
    await u.type(field, "1000000");
    expect(
      screen.getByRole("heading", { name: "도입 보류" }),
    ).toBeInTheDocument();
  });
  it("requires confirmation before clearing scoped logs and resets the order", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "주문 시작하기" }));
    await u.click(screen.getByRole("button", { name: "운영 대시보드" }));
    await u.click(screen.getByRole("button", { name: "체험 데이터 초기화" }));
    const dialog = screen.getByRole("alertdialog");
    await u.click(within(dialog).getByRole("button", { name: "초기화 확인" }));
    expect(screen.getByText("표시할 세션이 없습니다.")).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: "키오스크 체험" }));
    expect(
      screen.getByRole("button", { name: "주문 시작하기" }),
    ).toBeInTheDocument();
  });
  it("retains minimal events after a hook remount", () => {
    const ev: KioskEvent = {
      id: "e",
      sessionId: "s",
      mode: "A",
      source: "live",
      step: "start",
      at: 100,
      name: "session_started",
    };
    const one = renderHook(useEventStore);
    act(() => one.result.current.append(ev));
    one.unmount();
    const two = renderHook(useEventStore);
    expect(two.result.current.events).toEqual([ev]);
    expect(window.localStorage.getItem(EVENT_STORAGE_KEY)).toContain(
      "session_started",
    );
  });
  it("falls back to memory when browser storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { result } = renderHook(useEventStore);
    expect(result.current.storageFailed).toBe(true);
    act(() =>
      result.current.append({
        id: "e",
        sessionId: "s",
        mode: "A",
        source: "live",
        step: "start",
        at: 100,
        name: "session_started",
      }),
    );
    expect(result.current.events).toHaveLength(1);
  });
});
