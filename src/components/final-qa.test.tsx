import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
import Kiosk from "./Kiosk";

describe("final keyboard, scenario and readability regression", () => {
  it("traps dialog focus in both directions, handles Escape and restores trigger", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "운영 대시보드" }));
    const trigger = screen.getByRole("button", { name: "체험 데이터 초기화" });
    await u.click(trigger);
    const dialog = screen.getByRole("alertdialog");
    const cancel = within(dialog).getByRole("button", { name: "취소" }),
      confirm = within(dialog).getByRole("button", { name: "초기화 확인" });
    expect(cancel).toHaveFocus();
    await u.tab({ shift: true });
    expect(confirm).toHaveFocus();
    await u.tab();
    expect(cancel).toHaveFocus();
    await u.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("supports Enter activation and native Space acknowledgement in the order path", async () => {
    const u = userEvent.setup();
    render(<Kiosk mode="A" />);
    screen.getByRole("button", { name: "주문 시작하기" }).focus();
    await u.keyboard("{Enter}");
    screen.getByRole("button", { name: /아메리카노 3,900원 선택/ }).focus();
    await u.keyboard("{Enter}");
    screen.getByRole("button", { name: "시원하게 ICE" }).focus();
    await u.keyboard("{Enter}");
    screen.getByRole("button", { name: "장바구니 담기" }).focus();
    await u.keyboard("{Enter}");
    screen.getByRole("button", { name: "주문 검토" }).focus();
    await u.keyboard("{Enter}");
    screen.getByRole("button", { name: "모의 결제로" }).focus();
    await u.keyboard("{Enter}");
    const check = screen.getByRole("checkbox");
    check.focus();
    await u.keyboard(" ");
    expect(check).toBeChecked();
    screen.getByRole("button", { name: "모의 결제 완료" }).focus();
    await u.keyboard("{Enter}");
    expect(
      screen.getByRole("heading", { name: "주문이 완료됐어요." }),
    ).toBeInTheDocument();
  });
  it.each([
    ["옵션 선택 실패", "취향에 맞게 골라 주세요.", true],
    ["동일 단계 왕복", "어떤 한 잔이 좋으세요?", true],
    ["오랜 대기 + 오류", "취향에 맞게 골라 주세요.", true],
    ["정상 이용 · 오탐 억제", "어떤 한 잔이 좋으세요?", false],
    ["도움 거부 후 완료", "주문이 완료됐어요.", false],
    ["도움 수락 후 완료", "주문이 완료됐어요.", false],
  ] as const)(
    "replays %s with matching final state",
    async (label, title, offer) => {
      const u = userEvent.setup();
      render(<App />);
      await u.click(screen.getByRole("button", { name: "C 상황 인지형 선택" }));
      await u.click(
        screen.getByText("빠른 데모 시나리오", {
          selector: "summary",
          exact: false,
        }),
      );
      await u.click(
        screen.getByRole("button", {
          name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        }),
      );
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(
        !!screen.queryByRole("heading", { name: "잠시 막히셨나요?" }),
      ).toBe(offer);
    },
  );
  it("provides labelled keyboard-focusable scrolling regions", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "운영 대시보드" }));
    expect(
      screen.getByRole("region", { name: "A/B/C 지표 표 가로 스크롤" }),
    ).toHaveAttribute("tabindex", "0");
    expect(
      screen.getByRole("region", { name: "익명 이벤트 표 가로 스크롤" }),
    ).toHaveAttribute("tabindex", "0");
  });
  it("enlarges text without changing the selected workspace", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "사업성 분석" }));
    await u.click(screen.getByRole("button", { name: /글자 크게/ }));
    expect(document.documentElement.style.fontSize).toBe("18px");
    expect(
      screen.getByRole("heading", { name: "소규모 실증 권고" }),
    ).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: /글자 크게/ }));
    expect(document.documentElement.style.fontSize).toBe("16px");
  });
});
