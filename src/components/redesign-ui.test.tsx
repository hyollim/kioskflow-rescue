import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("redesigned workspace presentation and preserved interaction", () => {
  it("uses concise page headings and keeps one current navigation item", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "지원 방식별 키오스크 체험",
      }),
    ).toBeInTheDocument();
    for (const name of ["운영 대시보드", "사업성 분석", "프로젝트 소개"]) {
      await user.click(screen.getByRole("button", { name }));
      expect(
        screen.getByRole("heading", { level: 1, name }),
      ).toBeInTheDocument();
      const nav = screen.getByRole("navigation", { name: "주요 영역" });
      expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
      expect(within(nav).getByRole("button", { name })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });
  it("keeps experiment controls outside the cafe and retains manual B help", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen
        .getByRole("button", { name: "B 상시 도움형 선택" })
        .closest(".kiosk"),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "B 상시 도움형 선택" }),
    );
    await user.click(screen.getByRole("button", { name: "주문 시작하기" }));
    const kiosk = screen.getByLabelText("모의 주문 키오스크");
    await user.click(within(kiosk).getByRole("button", { name: "도움 요청" }));
    expect(
      within(kiosk).getByRole("region", { name: "상황별 도움" }),
    ).toBeInTheDocument();
    expect(
      within(kiosk).queryByRole("checkbox", { name: /자동 도움/ }),
    ).not.toBeInTheDocument();
  });
  it("keeps scenario provenance outside the cafe but the actual help and progress inside", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "C 상황 인지형 선택" }),
    );
    await user.click(screen.getByText("빠른 데모 시나리오"));
    await user.click(screen.getByRole("button", { name: /옵션 선택 실패/ }));
    const badge = screen.getByText(
      "데모 시나리오 · 가상 신호 / 대기 시간 가속",
    );
    expect(badge.closest(".kiosk")).toBeNull();
    const kiosk = screen.getByLabelText("모의 주문 키오스크");
    expect(
      within(kiosk).getByRole("region", { name: "상황별 도움" }),
    ).toBeInTheDocument();
    expect(
      within(kiosk).getByRole("listitem", { name: "2. 옵션 선택" }),
    ).toHaveAttribute("aria-current", "step");
    await user.click(
      within(kiosk).getByRole("button", { name: "괜찮아요, 직접 할게요" }),
    );
    expect(
      within(kiosk).queryByRole("region", { name: "상황별 도움" }),
    ).not.toBeInTheDocument();
  });
  it("groups support usage and intervention outcomes without changing synthetic KPIs", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "운영 대시보드" }));
    await user.click(screen.getByRole("button", { name: "가상 비교 데이터" }));
    const usage = screen
      .getByRole("heading", { name: "지원 이용" })
      .closest("section")!;
    const outcomes = screen
      .getByRole("heading", { name: "개입 결과" })
      .closest("section")!;
    expect(within(usage).getByText("직원 지원 요청률")).toBeInTheDocument();
    expect(
      within(outcomes).getByText("불필요 개입 대리지표"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("75.0%")).toHaveLength(4);
    expect(
      screen.getByRole("region", { name: "익명 이벤트 표 가로 스크롤" }),
    ).toHaveAttribute("tabindex", "0");
  });
  it("updates the compact financial summary from base profit to negative hold", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "사업성 분석" }));
    const summary = screen.getByRole("region", { name: "사업성 핵심 결과" });
    expect(within(summary).getByText("+628,000원")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /부정적 가정/ }));
    expect(within(summary).getByText("도입 보류")).toBeInTheDocument();
    expect(within(summary).getByText(/^-.*원$/)).toBeInTheDocument();
    expect(screen.getByText("회수 불가")).toBeInTheDocument();
  });
  it("announces a concise financial result instead of a whole repeated ledger", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "사업성 분석" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "월 운영 순편익 628,000원, 소규모 실증 권고",
    );
    expect(document.getElementById("business-results")).not.toHaveAttribute(
      "aria-live",
    );
    await user.click(screen.getByRole("button", { name: /부정적 가정/ }));
    expect(screen.getByRole("status")).toHaveTextContent("도입 보류");
    expect(screen.getByText("계산 기준 및 한계")).toBeInTheDocument();
  });
});
