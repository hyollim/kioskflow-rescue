export const scenarios = [
  ["options", "옵션 선택 실패"],
  ["back", "동일 단계 왕복"],
  ["idle", "오랜 대기 + 오류"],
  ["normal", "정상 이용 · 오탐 억제"],
  ["decline", "도움 거부 후 완료"],
  ["accept", "도움 수락 후 완료"],
] as const;
export type ScenarioId = (typeof scenarios)[number][0];
export interface ScenarioRequest {
  id: ScenarioId;
  nonce: number;
}
export default function ScenarioPanel({
  onRun,
}: {
  onRun: (id: ScenarioId) => void;
}) {
  return (
    <details className="scenario-console">
      <summary>
        <span className="scenario-symbol">↳</span> 빠른 데모 시나리오{" "}
        <span className="scenario-tag">가상 신호 · 실제 UI 반영</span>
      </summary>
      <div className="scenario-content">
        <p>
          현재 주문을 종료하고 재현용 세션을 시작합니다. 대기 시간은 가속하며,
          이벤트는 ‘데모 시나리오’로 분리 기록합니다. A/B에서는 같은 신호에도
          자동 개입하지 않습니다.
        </p>
        <div className="scenario-grid">
          {scenarios.map(([id, label], i) => (
            <button key={id} onClick={() => onRun(id)}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
