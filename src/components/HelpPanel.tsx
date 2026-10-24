import type { Step } from "../domain/order";
import type { useRescue } from "../hooks/useRescue";
import { Icon } from "./Visuals";
export default function HelpPanel({
  rescue,
  step,
}: {
  rescue: ReturnType<typeof useRescue>;
  step: Step;
}) {
  if (!rescue.help) return null;
  const tips: Record<Step, string[]> = {
    start: ["주문 시작하기를 눌러 주세요."],
    menu: [
      "원하는 메뉴의 카드를 선택해 주세요.",
      "메뉴를 고른 다음 온도와 사이즈를 정할 수 있어요.",
    ],
    options: [
      "HOT 또는 ICE 중 원하는 온도를 먼저 골라 주세요.",
      "기본 사이즈는 레귤러예요. 라지는 500원이 추가돼요.",
      "장바구니 담기를 눌러 다음으로 이동해요.",
    ],
    cart: [
      "수량의 + / − 버튼으로 개수를 바꿀 수 있어요.",
      "옵션 수정으로 온도와 사이즈를 다시 고를 수 있어요.",
      "준비되면 주문 검토를 눌러 주세요.",
    ],
    review: [
      "메뉴와 총금액을 확인해 주세요.",
      "수정하려면 주문 수정, 계속하려면 모의 결제로를 눌러요.",
    ],
    payment: [
      "실제 카드번호를 입력하지 않아요.",
      "모의 결제 확인란을 선택해 주세요.",
      "모의 결제 완료를 누르면 체험 주문이 끝나요.",
    ],
    complete: ["실제 결제 없이 체험을 완료했어요."],
  };
  return (
    <section className="help-panel" aria-label="상황별 도움" aria-live="polite">
      <div className="help-heading">
        <span className="help-icon">
          <Icon name="spark" />
        </span>
        <div>
          <span className="mini-label">
            {rescue.help.origin === "auto"
              ? "CONTEXTUAL SUPPORT"
              : "ON-DEMAND SUPPORT"}
          </span>
          <h3>
            {rescue.help.stage === "offer"
              ? "잠시 막히셨나요?"
              : "지금 화면을 함께 살펴봐요."}
          </h3>
        </div>
      </div>
      {rescue.help.stage === "offer" ? (
        <>
          <p>
            {rescue.reasonText}
            <br />
            필요할 때만 짧게 안내해 드릴게요.
          </p>
          <div className="help-buttons">
            <button className="primary" onClick={rescue.accept}>
              단계별 도움 받기
            </button>
            <button className="secondary" onClick={rescue.decline}>
              괜찮아요, 직접 할게요
            </button>
          </div>
        </>
      ) : (
        <>
          <ol>
            {tips[step].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          {rescue.staffNotice ? (
            <p className="staff-notice" role="status">
              직원 호출 시뮬레이션이 기록됐어요. 실제 직원에게 알림은 전송되지
              않습니다.
            </p>
          ) : (
            <button className="text-button" onClick={rescue.staff}>
              직원 호출 체험 <Icon name="arrow" size={16} />
            </button>
          )}
          <button className="close-help" onClick={rescue.close}>
            안내 닫기
          </button>
        </>
      )}
    </section>
  );
}
