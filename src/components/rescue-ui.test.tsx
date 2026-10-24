import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
describe("A/B/C UI and deterministic scenarios", () => {
  it("replays option friction in C and permits rejection", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "C 상황 인지형 선택" }));
    await u.click(
      screen.getByText("빠른 데모 시나리오", {
        exact: false,
        selector: "summary",
      }),
    );
    await u.click(screen.getByRole("button", { name: /옵션 선택 실패/ }));
    expect(
      screen.getByRole("heading", { name: "취향에 맞게 골라 주세요." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "잠시 막히셨나요?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("온도");
    await u.click(
      screen.getByRole("button", { name: "괜찮아요, 직접 할게요" }),
    );
    expect(
      screen.queryByRole("heading", { name: "잠시 막히셨나요?" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/이 주문에서는 자동 제안을/)).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: "도움 요청" }));
    expect(
      screen.getByRole("heading", { name: "지금 화면을 함께 살펴봐요." }),
    ).toBeInTheDocument();
  });
  it("B exposes only manual help and staff simulation", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "B 상시 도움형 선택" }));
    await u.click(screen.getByRole("button", { name: "주문 시작하기" }));
    expect(
      screen.queryByRole("checkbox", { name: /자동 도움/ }),
    ).not.toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: "도움 요청" }));
    await u.click(screen.getByRole("button", { name: /직원 호출 체험/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "실제 직원에게 알림은 전송되지 않습니다",
    );
  });
  it("normal idle alone does not trigger C and completed scenarios show the real terminal screen", async () => {
    const u = userEvent.setup();
    render(<App />);
    await u.click(screen.getByRole("button", { name: "C 상황 인지형 선택" }));
    await u.click(
      screen.getByText("빠른 데모 시나리오", {
        exact: false,
        selector: "summary",
      }),
    );
    await u.click(
      screen.getByRole("button", { name: /정상 이용 · 오탐 억제/ }),
    );
    expect(
      screen.queryByRole("heading", { name: "잠시 막히셨나요?" }),
    ).not.toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: /도움 수락 후 완료/ }));
    expect(
      screen.getByRole("heading", { name: "주문이 완료됐어요." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("데모 시나리오 · 가상 신호 / 대기 시간 가속"),
    ).toBeInTheDocument();
  });
});
