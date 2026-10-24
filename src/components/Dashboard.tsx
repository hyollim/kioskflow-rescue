import { useEffect, useMemo, useRef, useState } from "react";
import {
  computeKpis,
  formatRate,
  summarizeSessions,
} from "../domain/analytics";
import { createSyntheticEvents } from "../domain/synthetic";
import {
  eventLabels,
  type EventSource,
  type KioskEvent,
} from "../domain/events";
import { Icon } from "./Visuals";
import type { Step } from "../domain/order";
const steps: Record<Step, string> = {
  start: "시작",
  menu: "메뉴",
  options: "옵션",
  cart: "장바구니",
  review: "검토",
  payment: "모의 결제",
  complete: "완료",
};
function Metric({
  label,
  value,
  note,
  featured = false,
}: {
  label: string;
  value: string;
  note: string;
  featured?: boolean;
}) {
  return (
    <article className={`metric-card ${featured ? "featured" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}
export default function Dashboard({
  events,
  onClear,
  storageFailed,
}: {
  events: KioskEvent[];
  onClear: () => void;
  storageFailed: boolean;
}) {
  const [source, setSource] = useState<EventSource>("live"),
    [mode, setMode] = useState("all"),
    [confirm, setConfirm] = useState(false);
  const dialogRef = useRef<HTMLElement>(null),
    clearTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!confirm) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setConfirm(false);
        return;
      }
      if (event.key === "Tab") {
        const buttons =
          dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTrigger.current?.focus();
    };
  }, [confirm]);
  const synthetic = useMemo(createSyntheticEvents, []);
  const sourceEvents =
    source === "synthetic"
      ? synthetic
      : events.filter((e) => e.source === source);
  const filtered = sourceEvents.filter(
    (e) => mode === "all" || e.mode === mode,
  );
  const k = computeKpis(filtered);
  const sessions = summarizeSessions(filtered);
  const time = (e: KioskEvent) => {
    const s = sessions.find((s) => s.id === e.sessionId);
    return s ? `${Math.max(0, (e.at - s.start.at) / 1000).toFixed(1)}초` : "—";
  };
  const errors = Object.entries(steps)
    .map(([id, label]) => ({
      id,
      label,
      count: filtered.filter(
        (e) => e.name === "invalid_action" && e.step === id,
      ).length,
    }))
    .filter((x) => x.count > 0);
  const maxError = Math.max(1, ...errors.map((x) => x.count));
  return (
    <div className="dashboard-page">
      <div className="analysis-intro">
        <div>
          <h1>운영 대시보드</h1>
          <p>주문 완료와 이탈, 지원 이용 및 입력 오류를 출처별로 확인합니다.</p>
        </div>
        <div className="analysis-badge">
          <Icon name="shield" size={17} />{" "}
          {storageFailed ? "현재 탭 메모리에서만 동작" : "이 브라우저에만 저장"}
          <small>이름 · 연락처 · 결제정보 미수집</small>
        </div>
      </div>
      <div className="data-toolbar">
        <div className="segmented" role="group" aria-label="분석 데이터 출처">
          {(
            [
              ["live", "실제 체험 로그"],
              ["scenario", "데모 시나리오"],
              ["synthetic", "가상 비교 데이터"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              aria-pressed={source === id}
              className={source === id ? "active" : ""}
              onClick={() => setSource(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="mode-filter">
          지원 방식{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="all">전체 A/B/C</option>
            <option value="A">A 기본형</option>
            <option value="B">B 상시 도움형</option>
            <option value="C">C 상황 인지형</option>
          </select>
        </label>
      </div>
      <div
        className={`data-disclaimer ${source === "synthetic" ? "hypothetical" : ""}`}
      >
        <span className="status-dot" />
        <p>
          {source === "live"
            ? "이 브라우저에서 직접 조작한 체험 로그입니다. 실매장 고객 데이터나 통제 실험 결과가 아닙니다."
            : source === "scenario"
              ? "재현 버튼으로 만든 가상 신호·가속 시간입니다. 실제 체험 로그와 합산하지 않으며 효과 검증 자료가 아닙니다."
              : "가상 시나리오 기반 비교입니다. 사전 정의한 12개 합성 세션이며 실험 결과·성능 우위의 근거가 아닙니다. A/B/C 완료율은 의도적으로 동일하게 구성했습니다."}
        </p>
      </div>
      <div className="metrics-primary">
        <Metric
          featured
          label="종료 세션 기준 완료율"
          value={formatRate(k.completionRate)}
          note={`완료 ${k.completed} / 종료 ${k.ended}세션`}
        />
        <Metric
          label="중도 이탈률"
          value={formatRate(k.abandonmentRate)}
          note={`명시 종료 ${k.abandoned} / 종료 ${k.ended}세션`}
        />
        <Metric
          label="평균 완료 소요시간"
          value={
            k.averageCompletionSeconds === null
              ? "—"
              : `${k.averageCompletionSeconds.toFixed(1)}초`
          }
          note={`완료 ${k.completed}세션만 · ${source === "live" ? "실제 경과" : "가상 경과"} 시간`}
        />
        <Metric
          label="시작한 세션"
          value={`${k.started}건`}
          note={`완료 ${k.completed} · 종료 ${k.abandoned} · 미종료 ${k.open}`}
        />
      </div>
      {k.started === 0 && (
        <div className="empty-analytics">
          <Icon name="chart" size={28} />
          <h2>표시할 세션이 없습니다.</h2>
          <p>
            키오스크를 체험하거나 ‘가상 비교 데이터’로 계산 방식을 확인해
            보세요.
            <br />빈 데이터의 비율을 0% 성과로 표시하지 않습니다.
          </p>
        </div>
      )}
      <div className="section-heading">
        <div>
          <h2>지원 이용 및 개입 결과</h2>
        </div>
        <span className="subtle">모든 비율은 현재 출처·모드 필터 기준</span>
      </div>
      <div className="support-analysis">
        <section className="support-group support-volume">
          <div className="support-group-heading">
            <h3>지원 이용</h3>
          </div>
          <div className="support-group-metrics">
            <Metric
              label="도움 요청률"
              value={formatRate(k.helpRequestRate)}
              note={`직접 요청한 세션 / 시작 ${k.started}세션`}
            />
            <Metric
              label="자동 개입 발생률"
              value={formatRate(k.autoOfferRate)}
              note={`자동 제안 경험 세션 / 시작 ${k.started}세션`}
            />
            <Metric
              label="직원 지원 요청률"
              value={formatRate(k.staffRequestRate)}
              note={`직원 호출 체험 세션 / 시작 ${k.started}세션`}
            />
          </div>
        </section>
        <section className="support-group support-outcomes">
          <div className="support-group-heading">
            <h3>개입 결과</h3>
          </div>
          <div className="support-group-metrics">
            <Metric
              label="제안 수락률"
              value={formatRate(k.acceptanceRate)}
              note={`수락 ${k.accepted} / 제안 ${k.offers}회`}
            />
            <Metric
              label="제안 거부율"
              value={formatRate(k.dismissalRate)}
              note={`거절 ${k.dismissed} / 제안 ${k.offers}회 · 미응답 ${k.unanswered}`}
            />
            <Metric
              label="도움 이후 완료율"
              value={formatRate(k.afterHelpCompletionRate)}
              note={`도움 이용 후 완료 ${k.helpCompleted} / 종료 ${k.helpEnded}세션`}
            />
            <Metric
              label="불필요 개입 대리지표"
              value={formatRate(k.unnecessaryProxyRate)}
              note={`거절 후 30초 내 자력 완료 ${k.proxy} / 종료된 거절 제안 ${k.proxyEligible}회`}
            />
          </div>
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>A / B / C 관측 비교</h2>
            </div>
            <span className="small-chip">
              {source === "synthetic"
                ? "가상 시나리오 기반 비교"
                : "통제 실험 아님"}
            </span>
          </div>
          <p className="panel-note">
            모드 필터와 별개로 선택한 출처의 세 방식을 나란히 보여줍니다.
            표본·난이도·사용자 차이가 있어 인과효과를 추론할 수 없습니다.
          </p>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="A/B/C 지표 표 가로 스크롤"
          >
            <table className="comparison-table">
              <caption className="sr-only">출처별 A/B/C 관측 지표 비교</caption>
              <thead>
                <tr>
                  <th scope="col">방식</th>
                  <th scope="col">종료 세션</th>
                  <th scope="col">완료율</th>
                  <th scope="col">평균 시간</th>
                  <th scope="col">자동 제안</th>
                </tr>
              </thead>
              <tbody>
                {(["A", "B", "C"] as const).map((m) => {
                  const x = computeKpis(
                    sourceEvents.filter((e) => e.mode === m),
                  );
                  return (
                    <tr key={m}>
                      <th scope="row">
                        <span className={`mode-tag mode-${m}`}>{m}</span>{" "}
                        {m === "A"
                          ? "기본형"
                          : m === "B"
                            ? "상시 도움형"
                            : "상황 인지형"}
                      </th>
                      <td>{x.ended}건</td>
                      <td>{formatRate(x.completionRate)}</td>
                      <td>
                        {x.averageCompletionSeconds === null
                          ? "—"
                          : `${x.averageCompletionSeconds.toFixed(1)}초`}
                      </td>
                      <td>{x.offers}회</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel friction-panel">
          <h2>입력 오류가 발생한 화면</h2>
          <p className="panel-note">
            오류 횟수이며 실제 어려움의 확정값은 아닙니다.
          </p>
          {errors.length === 0 ? (
            <p className="no-friction">기록된 필수 입력 오류가 없어요.</p>
          ) : (
            errors.map((e) => (
              <div className="friction-row" key={e.id}>
                <span>{e.label}</span>
                <div>
                  <i style={{ width: `${(e.count / maxError) * 100}%` }} />
                </div>
                <strong>{e.count}회</strong>
              </div>
            ))
          )}
          <div className="interpretation">
            <Icon name="info" size={18} />
            <p>
              ‘거절 후 빠른 완료’는 오탐의 대리지표일 뿐입니다. 실제 불필요
              여부는 현장 관찰·사용자 확인이 필요합니다.
            </p>
          </div>
        </section>
      </div>
      <section className="panel event-panel">
        <div className="panel-heading">
          <div>
            <h2>익명 이벤트 로그</h2>
          </div>
          <span className="small-chip">
            현재 필터 {filtered.length}개 · 최근 30개 표시
          </span>
        </div>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="익명 이벤트 표 가로 스크롤"
        >
          <table className="event-table">
            <caption className="sr-only">익명 세션 이벤트 로그</caption>
            <thead>
              <tr>
                <th scope="col">세션</th>
                <th scope="col">출처 / 방식</th>
                <th scope="col">이벤트</th>
                <th scope="col">화면</th>
                <th scope="col">세션 경과</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice(-30)
                .reverse()
                .map((e) => (
                  <tr key={e.id}>
                    <td className="mono">
                      {e.source === "synthetic"
                        ? e.sessionId.replace("synthetic-", "S-")
                        : `${e.sessionId.slice(0, 8)}…`}
                    </td>
                    <td>
                      {e.source === "live"
                        ? "실제 체험"
                        : e.source === "scenario"
                          ? "데모"
                          : "합성"}{" "}
                      · {e.mode}
                    </td>
                    <td>
                      {eventLabels[e.name]}
                      <small className="event-code">{e.name}</small>
                    </td>
                    <td>{steps[e.step]}</td>
                    <td>{time(e)}</td>
                  </tr>
                ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-table">
                    표시할 이벤트가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <div className="data-footer">
        <p>
          최대 2,000개 이벤트를 브라우저에 저장하며 오래된 세션부터 정리합니다.
          새로고침 시 로그는 유지되지만 진행 주문은 복원하지 않습니다. 미종료
          세션은 이탈로 추정하지 않습니다.
        </p>
        <button
          ref={clearTrigger}
          className="danger-outline"
          onClick={() => setConfirm(true)}
        >
          <Icon name="reset" size={16} /> 체험 데이터 초기화
        </button>
      </div>
      {confirm && (
        <div className="modal-backdrop">
          <section
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            aria-describedby="clear-description"
            className="confirm-dialog"
          >
            <h2 id="clear-title">이 브라우저의 체험 로그를 지울까요?</h2>
            <p id="clear-description">
              실제 체험·데모 로그와 진행 주문이 초기화됩니다. 가상 비교 데이터는
              유지됩니다.
            </p>
            <div>
              <button
                className="secondary"
                autoFocus
                onClick={() => setConfirm(false)}
              >
                취소
              </button>
              <button
                className="primary"
                onClick={() => {
                  onClear();
                  setConfirm(false);
                }}
              >
                초기화 확인
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
