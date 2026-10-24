import { useEffect, useState } from "react";
import Kiosk from "./components/Kiosk";
import { Icon } from "./components/Visuals";
import ScenarioPanel, {
  type ScenarioRequest,
} from "./components/ScenarioPanel";
import Dashboard from "./components/Dashboard";
import Business from "./components/Business";
import { useEventStore } from "./hooks/useEventStore";
import { eventLabels } from "./domain/events";
import type { Mode } from "./domain/order";

const navigation = [
  ["kiosk", "키오스크 체험", "terminal"],
  ["dashboard", "운영 대시보드", "chart"],
  ["business", "사업성 분석", "calculator"],
  ["about", "프로젝트 소개", "document"],
] as const;
type WorkspaceTab = (typeof navigation)[number][0];

export default function App() {
  const [tab, setTab] = useState<WorkspaceTab>("kiosk");
  const [large, setLarge] = useState(false);
  const [mode, setMode] = useState<Mode>("A");
  const store = useEventStore();
  const events = store.events;
  const [epoch, setEpoch] = useState(0);
  const [scenario, setScenario] = useState<ScenarioRequest>();
  useEffect(() => {
    document.documentElement.style.fontSize = large ? "18px" : "16px";
    return () => {
      document.documentElement.style.fontSize = "16px";
    };
  }, [large]);
  const changeTab = (next: WorkspaceTab) => {
    setTab(next);
    document.getElementById("main")?.scrollIntoView?.({ block: "start" });
  };
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        본문으로 이동
      </a>
      <header className="site-header">
        <div className="brand-row">
          <a className="brand" href="#main" onClick={() => changeTab("kiosk")}>
            <span className="brand-symbol" aria-hidden="true">
              K
            </span>
            <span>
              KioskFlow<span className="brand-sub">Rescue 운영 플랫폼</span>
            </span>
          </a>
          <button
            className="font-toggle"
            aria-pressed={large}
            onClick={() => setLarge(!large)}
          >
            <span aria-hidden="true">Aa</span> 글자 크게
          </button>
        </div>
        <div className="nav-label">워크스페이스</div>
        <nav aria-label="주요 영역">
          {navigation.map(([id, label, icon]) => (
            <button
              key={id}
              className={`nav-link ${tab === id ? "active" : ""}`}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => changeTab(id)}
            >
              <Icon name={icon} size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="workspace-meta">
          <span className="environment-label">
            <span className="status-dot" />
            로컬 시뮬레이션
          </span>
          <p>
            개인 비공식 포트폴리오
            <br />
            실매장 운영·결제 아님
          </p>
          <span className="workspace-version">KioskFlow Rescue · 2026</span>
        </div>
      </header>
      <div className="workspace">
        <div className="workspace-header">
          <div className="workspace-breadcrumb">
            <span>워크스페이스</span>
            <Icon name="chevron" size={16} />
            <strong>{navigation.find(([id]) => id === tab)?.[1]}</strong>
          </div>
          <span className="environment-pill">모의 환경</span>
        </div>
        <main id="main" className="workspace-main">
          <section hidden={tab !== "kiosk"}>
            <div className="page-intro">
              <div>
                <h1>지원 방식별 키오스크 체험</h1>
                <p>A/B/C 지원 방식을 선택하고 주문을 체험합니다.</p>
              </div>
              <span className="page-tag">
                <Icon name="terminal" size={16} />
                작동하는 시제품
              </span>
            </div>
            <div className="experiment-settings">
              <div className="experiment-heading">
                <h2>지원 방식 설정</h2>
                <p>변경 시 진행 주문 종료</p>
              </div>
              <div
                className="mode-selector"
                role="group"
                aria-label="지원 방식 선택"
              >
                {(
                  [
                    ["A", "기본형", "추가 도움 없이 주문"],
                    ["B", "상시 도움형", "사용자가 직접 도움 요청"],
                    ["C", "상황 인지형", "복합 신호에 따른 도움 제안"],
                  ] as const
                ).map(([id, label, desc]) => (
                  <button
                    key={id}
                    className={`mode-card ${mode === id ? "selected" : ""}`}
                    aria-label={`${id} ${label} 선택`}
                    aria-pressed={mode === id}
                    onClick={() => {
                      setMode(id);
                      setScenario(undefined);
                    }}
                  >
                    <span className="mode-letter">{id}</span>
                    <div>
                      <strong>{label}</strong>
                      <p>{desc}</p>
                    </div>
                    {mode === id && (
                      <span className="mode-check">
                        <Icon name="check" size={16} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <ScenarioPanel
              onRun={(id) => setScenario({ id, nonce: Date.now() })}
            />
            <div className="experience-grid">
              <Kiosk
                key={epoch}
                mode={mode}
                scenario={scenario}
                onEvent={store.append}
              />
              <aside className="experience-sidebar" aria-label="체험 관측 정보">
                <section className="observer-panel">
                  <div className="panel-heading">
                    <h2>체험 상태</h2>
                    <span className={`mode-tag mode-${mode}`}>{mode}</span>
                  </div>
                  <h3>
                    {mode === "A"
                      ? "기본 주문 흐름"
                      : mode === "B"
                        ? "사용자 요청 기반 지원"
                        : "상황 기반 지원"}
                  </h3>
                  <p>
                    {mode === "A"
                      ? "필수 입력 오류만 안내합니다. 추가 도움 없이 기본 주문 경험을 확인합니다."
                      : mode === "B"
                        ? "직접 요청한 경우에만 현재 단계의 도움을 제공합니다. 자동 제안은 하지 않습니다."
                        : "오류·왕복·수정과 대기를 조합합니다. 단독 대기는 개입하지 않으며, 거절 후 자동 제안을 중지합니다."}
                  </p>
                  <dl className="observer-facts">
                    <div>
                      <dt>판단 방식</dt>
                      <dd>설명 가능한 규칙</dd>
                    </div>
                    <div>
                      <dt>기록 범위</dt>
                      <dd>익명 조작 이벤트</dd>
                    </div>
                    <div>
                      <dt>결제·직원 알림</dt>
                      <dd>시뮬레이션</dd>
                    </div>
                  </dl>
                </section>
                <section className="event-peek">
                  <div className="panel-heading">
                    <h2>최근 이벤트</h2>
                    <span className="small-chip">최근 5개</span>
                  </div>
                  {events.length === 0 ? (
                    <p className="no-events">
                      주문을 시작하면 이벤트가 기록됩니다.
                    </p>
                  ) : (
                    <ol>
                      {events
                        .slice(-5)
                        .reverse()
                        .map((e) => (
                          <li key={e.id}>
                            <span>{eventLabels[e.name]}</span>
                            <small>
                              {e.mode} ·{" "}
                              {e.source === "live" ? "실제 체험" : "데모"}
                            </small>
                          </li>
                        ))}
                    </ol>
                  )}
                  <button
                    className="text-button"
                    onClick={() => changeTab("dashboard")}
                  >
                    운영 지표 확인
                    <Icon name="arrow" size={16} />
                  </button>
                </section>
                <p className="sidebar-footnote">
                  실제 주문·결제·직원 호출은 전송되지 않습니다.
                  이름·연락처·결제정보는 수집하지 않습니다.
                </p>
              </aside>
            </div>
          </section>
          <section hidden={tab !== "dashboard"}>
            <Dashboard
              events={events}
              storageFailed={store.storageFailed}
              onClear={() => {
                store.clear();
                setEpoch((n) => n + 1);
                setScenario(undefined);
              }}
            />
          </section>
          <section hidden={tab !== "business"}>
            <Business />
          </section>
          <section hidden={tab !== "about"} className="about-page">
            <div className="page-intro">
              <div>
                <h1>프로젝트 소개</h1>
                <p>
                  현장 문제 정의부터 시제품, 운영 지표, 사업성 검토까지 연결한
                  개인 포트폴리오입니다.
                </p>
              </div>
              <span className="page-tag">비공식 개인 제안</span>
            </div>
            <section className="project-summary">
              <div className="project-summary-title">
                <span className="brand-symbol" aria-hidden="true">
                  K
                </span>
                <div>
                  <h2>KioskFlow Rescue</h2>
                  <p>
                    무인 주문 지원의 가치와 비용을 검증하는 규칙 기반 시제품
                  </p>
                </div>
              </div>
              <dl>
                <div>
                  <dt>목표 사용자</dt>
                  <dd>카페·외식 고객사 운영 담당자</dd>
                </div>
                <div>
                  <dt>핵심 검증</dt>
                  <dd>주문 중 마찰, 지원 선택, 고객사 증분 손익</dd>
                </div>
                <div>
                  <dt>구현 범위</dt>
                  <dd>정적 웹앱 · 브라우저 로컬 이벤트 · 가정 기반 분석</dd>
                </div>
                <div>
                  <dt>현재 단계</dt>
                  <dd>시제품 검증 완료 · 실매장 효과 검증 전</dd>
                </div>
              </dl>
            </section>
            <div className="about-grid">
              <article>
                <span className="section-number">01</span>
                <h2>현장 문제 정의</h2>
                <p>
                  옵션 선택·화면 이동·결제 검토에서 발생하는 마찰에 집중합니다.
                  연령이나 장애를 추정하지 않고 조작 맥락만 관찰합니다.
                </p>
              </article>
              <article>
                <span className="section-number">02</span>
                <h2>지원 대안 비교</h2>
                <p>
                  A 기본형, B 직접 요청형, C 상황 인지형을 같은 주문 흐름에서
                  비교합니다. 거부·억제 조건과 부정적 손익도 판단에 포함합니다.
                </p>
              </article>
              <article>
                <span className="section-number">03</span>
                <h2>검증과 한계</h2>
                <p>
                  AI 학습·실결제·실제 직원 호출은 없습니다. NICE의 기존 접근성
                  기능을 대체하지 않으며, 공식 도입·협력·인증을 주장하지
                  않습니다.
                </p>
              </article>
            </div>
            <div className="source-box">
              <div>
                <h2>기획·검증 자료</h2>
                <p>
                  요구사항 → 기술 대안 → 시제품 → KPI·손익 → 실증·파트너 전략
                </p>
              </div>
              <a
                href="https://github.com/hyollim/kioskflow-rescue/tree/feature/autonomous-build/docs"
                target="_blank"
                rel="noreferrer"
              >
                전체 문서
                <Icon name="external" size={16} />
              </a>
            </div>
            <div className="document-links">
              <a
                className="proposal-link"
                href="https://github.com/hyollim/kioskflow-rescue/blob/feature/autonomous-build/deliverables/KioskFlow_Rescue_B2B_Proposal_KO.pdf"
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="document" size={22} />
                <div>
                  <strong>한국어 사업제안서 · 13쪽</strong>
                  <p>시제품 화면, 손익, 실증 및 제휴 계획</p>
                </div>
                <Icon name="external" size={17} />
              </a>
              {[
                ["PRD", "제품 요구사항"],
                ["MARKET_RESEARCH", "시장·경쟁 및 출처"],
                ["BUSINESS_MODEL", "사업모델·손익 수식"],
                ["PILOT_PLAN", "실증·Go/No-Go 계획"],
                ["PARTNER_STRATEGY", "파트너·연동 전략"],
                ["KPI_DEFINITIONS", "KPI 분모·한계"],
                ["TEST_REPORT", "실제 테스트 결과"],
                ["LIMITATIONS", "한계·후속 검증"],
              ].map(([file, title]) => (
                <a
                  key={file}
                  href={`https://github.com/hyollim/kioskflow-rescue/blob/feature/autonomous-build/docs/${file}.md`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="document" size={18} />
                  <strong>{title}</strong>
                  <Icon name="external" size={16} />
                </a>
              ))}
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <span>KioskFlow Rescue · 2026</span>
          <p>개인 비공식 포트폴리오 · 실제 결제 없음</p>
        </footer>
      </div>
    </div>
  );
}
