import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
describe("working kiosk MVP", () => {
  it("completes an order with required options, cart edits and explicit mock payment", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /주문 시작하기/ }));
    await user.click(
      screen.getByRole("button", { name: /아메리카노 3,900원 선택/ }),
    );
    await user.click(screen.getByRole("button", { name: /장바구니 담기/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("온도");
    await user.click(screen.getByRole("button", { name: "시원하게 ICE" }));
    await user.click(screen.getByRole("button", { name: /장바구니 담기/ }));
    await user.click(
      screen.getByRole("button", { name: "아메리카노 수량 늘리기" }),
    );
    expect(screen.getAllByText("7,800원").length).toBeGreaterThan(0);
    await user.click(
      screen.getByRole("button", { name: "아메리카노 옵션 수정" }),
    );
    await user.click(screen.getByRole("button", { name: /라지/ }));
    await user.click(screen.getByRole("button", { name: /수정 완료/ }));
    expect(screen.getAllByText("8,800원").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /주문 검토/ }));
    await user.click(screen.getByRole("button", { name: /모의 결제로/ }));
    await user.click(screen.getByRole("button", { name: /모의 결제 완료/ }));
    expect(screen.getByRole("alert")).toHaveTextContent("안내");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /모의 결제 완료/ }));
    expect(
      screen.getByRole("heading", { name: "주문이 완료됐어요." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("실제 결제나 매장 주문은 발생하지 않았습니다."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /새로운 주문 체험/ }));
    expect(
      screen.getByRole("button", { name: /주문 시작하기/ }),
    ).toBeInTheDocument();
  });
  it("prevents empty checkout and supports category and abandonment", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /주문 시작하기/ }));
    await user.click(screen.getByRole("button", { name: "논커피" }));
    expect(
      screen.queryByRole("button", { name: /아메리카노 3,900원 선택/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /장바구니 0원/ }));
    expect(screen.getByRole("button", { name: /주문 검토/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "주문 종료" }));
    expect(
      screen.getByRole("heading", { name: "주문이 종료되었습니다." }),
    ).toBeInTheDocument();
  });
  it("preserves the order while viewing project information", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /주문 시작하기/ }));
    await user.click(screen.getByRole("button", { name: "프로젝트 소개" }));
    expect(
      screen.getByRole("heading", { name: "프로젝트 소개" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "키오스크 체험" }));
    expect(
      within(screen.getByLabelText("모의 주문 키오스크")).getByRole("heading", {
        name: "어떤 한 잔이 좋으세요?",
      }),
    ).toBeInTheDocument();
  });
});
