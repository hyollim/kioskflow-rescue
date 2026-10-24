import { useState } from "react";
import {
  baseInputs,
  businessPresets,
  calculateBusiness,
  inputSpec,
  validateBusiness,
  type BusinessInputs,
} from "../domain/business";
import { formatWon } from "../domain/order";
import { Icon } from "./Visuals";
const count = (n: number) =>
  n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
export default function Business() {
  const [values, setValues] = useState<BusinessInputs>({ ...baseInputs }),
    [preset, setPreset] = useState("base");
  const errors = validateBusiness(values),
    r = errors.length ? null : calculateBusiness(values);
  const updates = (key: keyof BusinessInputs, value: number) => {
    setValues({ ...values, [key]: value });
    setPreset("custom");
  };
  return (
    <div className="business-page">
      <div className="analysis-intro">
        <div>
          <h1>사업성 분석</h1>
          <p>
            운영 규모와 비용 가정을 조정해 고객사의 증분 손익과 도입 조건을
            검토합니다.
          </p>
        </div>
        <div className="analysis-badge">
          <Icon name="chart" size={19} /> 원 / 월 기준 손익
          <small>도입 전 대비 증분 모델</small>
        </div>
      </div>
      <div className="business-warning">
        <Icon name="info" size={17} />
        <p>
          <strong>가상 가정 기반 분석입니다.</strong> 실제 NICE 제품 가격·고객사
          성과가 아니며, 도입 전 관측치와 견적 검증이 필요합니다.
        </p>
      </div>
      <div className="preset-grid" role="group" aria-label="사업성 시나리오">
        {businessPresets.map((p) => (
          <button
            key={p.id}
            className={preset === p.id ? "selected" : ""}
            aria-pressed={preset === p.id}
            onClick={() => {
              setValues({ ...p.inputs });
              setPreset(p.id);
            }}
          >
            <span className="preset-dot" />
            <strong>{p.label}</strong>
            <small>{p.description}</small>
          </button>
        ))}
      </div>
      <p className="preset-explanation">
        {businessPresets.find((p) => p.id === preset)?.description ??
          "직접 조정한 가정입니다. 시나리오를 선택하면 해당 값으로 되돌아갑니다."}
      </p>
      {r && (
        <section
          className={`business-quick-result ${r.monthlyNet < 0 ? "negative" : ""}`}
          aria-label="사업성 핵심 결과"
        >
          <div>
            <span>월 운영 순편익</span>
            <strong>
              {r.monthlyNet > 0 ? "+" : ""}
              {formatWon(r.monthlyNet)}
            </strong>
            <p>{r.recommendation}</p>
          </div>
          <button
            className="quick-result-link"
            onClick={() =>
              document
                .getElementById("business-results")
                ?.scrollIntoView?.({ block: "start" })
            }
          >
            결과 보기
            <Icon name="arrow" size={16} />
          </button>
        </section>
      )}
      <p className="sr-only" role="status">
        {r
          ? `월 운영 순편익 ${formatWon(r.monthlyNet)}, ${r.recommendation}`
          : ""}
      </p>
      <div className="business-layout">
        <section className="panel inputs-panel">
          <div className="panel-heading">
            <div>
              <h2>입력 가정</h2>
            </div>
            <span className="small-chip">
              {preset === "custom" ? "직접 조정" : "가상 가정"}
            </span>
          </div>
          {(["volume", "benefit", "cost"] as const).map((group, index) => (
            <fieldset className="business-fields" key={group}>
              <legend>
                <span>{String(index + 1).padStart(2, "0")}</span>{" "}
                {group === "volume"
                  ? "운영 규모와 현재 상태"
                  : group === "benefit"
                    ? "회복·절감 가정"
                    : "비용과 오개입 위험"}
              </legend>
              {inputSpec
                .filter((x) => x.group === group)
                .map((spec) => (
                  <div className="number-field" key={spec.key}>
                    <label htmlFor={`input-${spec.key}`}>{spec.label}</label>
                    <div>
                      <input
                        id={`input-${spec.key}`}
                        aria-describedby={`unit-${spec.key}`}
                        type="number"
                        inputMode="decimal"
                        min={spec.key === "devices" ? 1 : 0}
                        max={spec.max}
                        step={spec.percent ? 0.1 : (spec.step ?? 1)}
                        value={
                          Number.isFinite(values[spec.key])
                            ? Number(
                                (
                                  values[spec.key] * (spec.percent ? 100 : 1)
                                ).toFixed(6),
                              )
                            : ""
                        }
                        onChange={(e) =>
                          updates(
                            spec.key,
                            Number(e.target.value) / (spec.percent ? 100 : 1),
                          )
                        }
                      />
                      <small id={`unit-${spec.key}`}>{spec.unit}</small>
                    </div>
                  </div>
                ))}
            </fieldset>
          ))}
          <p className="input-footnote">
            회복 비율은 ‘중단된 거래’ 중 회복되는 비율입니다. 직원 요청 감소율은
            요청률의 %p 차이가 아닌 기존 호출 건수의 상대 감소율입니다. 오개입
            추가비는 다른 공헌이익·직원비와 중복되지 않는 비용 가정입니다.
          </p>
        </section>
        <div className="business-results" id="business-results">
          {errors.length > 0 ? (
            <div className="error" role="alert">
              <strong>입력 범위를 확인해 주세요.</strong>
              <ul>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          ) : (
            r && (
              <>
                <section
                  className={`recommendation ${r.recommendation === "도입 보류" ? "hold" : r.recommendation === "실증 추가 필요" ? "review" : "pilot"}`}
                >
                  <div>
                    <h2>{r.recommendation}</h2>
                    <Icon
                      name={
                        r.recommendation === "도입 보류" ? "shield" : "arrow"
                      }
                      size={28}
                    />
                  </div>
                  {r.reasons.map((reason) => (
                    <p key={reason}>{reason}</p>
                  ))}
                  <small>월 순편익·회수기간·오개입률 기준</small>
                </section>
                <div className="result-cards">
                  <article
                    className={r.monthlyNet >= 0 ? "positive" : "negative"}
                  >
                    <span>월 운영 순편익</span>
                    <strong>
                      {r.monthlyNet > 0 ? "+" : ""}
                      {formatWon(r.monthlyNet)}
                    </strong>
                    <small>도입 전 대비 월 손익 변화</small>
                  </article>
                  <article>
                    <span>단순 투자 회수기간</span>
                    <strong>
                      {r.paybackMonths === null
                        ? "회수 불가"
                        : `${r.paybackMonths.toFixed(1)}개월`}
                    </strong>
                    <small>초기비 ÷ 양(+)의 월 순편익</small>
                  </article>
                  <article>
                    <span>12개월 ROI</span>
                    <strong>
                      {r.roi12 === null
                        ? "정의 불가"
                        : `${(r.roi12 * 100).toFixed(1)}%`}
                    </strong>
                    <small>
                      {r.roi12 === null
                        ? "초기비가 0이면 비율 미정의"
                        : "초기비 차감 후 / 초기비"}
                    </small>
                  </article>
                  <article>
                    <span>가상 회복 거래</span>
                    <strong>{count(r.recovered)}건</strong>
                    <small>월 {count(r.attempts)}건 시도 기준</small>
                  </article>
                </div>
                <section className="panel waterfall-panel">
                  <h2>월 순편익의 구성</h2>
                  <div className="profit-rows">
                    <div>
                      <span>주문 회복 공헌이익</span>
                      <strong className="amount-plus">
                        +{formatWon(r.recoveryProfit)}
                      </strong>
                    </div>
                    <div>
                      <span>직원 지원 비용 절감</span>
                      <strong className="amount-plus">
                        +{formatWon(r.staffSavings)}
                      </strong>
                    </div>
                    <div>
                      <span>솔루션 이용료 (전체)</span>
                      <strong>−{formatWon(r.subscription)}</strong>
                    </div>
                    <div>
                      <span>운영·유지비 (전체)</span>
                      <strong>−{formatWon(values.maintenanceTotal)}</strong>
                    </div>
                    <div>
                      <span>오개입 추가 운영비</span>
                      <strong>−{formatWon(r.falseCost)}</strong>
                    </div>
                    <div className="profit-total">
                      <span>월 운영 순편익</span>
                      <strong>{formatWon(r.monthlyNet)}</strong>
                    </div>
                  </div>
                  <p className="panel-note">
                    초기 설치·통합비 {formatWon(values.setupTotal)}는
                    일회성으로, 월 순편익에서 중복 차감하지 않습니다.
                  </p>
                </section>
                <section className="panel before-after">
                  <h2>같은 범위의 운영손익 비교</h2>
                  <div>
                    <span>도입 전 월 운영손익</span>
                    <strong>{formatWon(r.beforeProfit)}</strong>
                  </div>
                  <div>
                    <span>도입 후 월 운영손익</span>
                    <strong>{formatWon(r.afterProfit)}</strong>
                  </div>
                  <div>
                    <span>초기비 차감한 12개월 증분 현금흐름</span>
                    <strong>{formatWon(r.annualNetAfterSetup)}</strong>
                  </div>
                  <p className="panel-note">
                    매출이 아니라 변동비 차감 후 공헌이익에서 해당 직원 지원비와
                    솔루션 비용을 뺀 범위입니다. 매장 전체 당기순이익이
                    아닙니다.
                  </p>
                </section>
              </>
            )
          )}
        </div>
      </div>
      <details className="methodology-details">
        <summary>계산 기준 및 한계</summary>
        <div>
          <h3>계산 범위</h3>
          <p>
            현재 이탈률·회복률·호출비는 실측 전입니다. 실제 관측치와 통합 견적을
            입력해야 도입 판단에 사용할 수 있습니다. 세금·금융비용·계절성은
            제외한 단순 증분 모델입니다.
          </p>
          <h3>가정 기반 의사결정 규칙</h3>
          <p>
            순편익 ≤ 0 또는 오개입률 ≥ 20%는 보류합니다. 회수기간 &gt; 12개월
            또는 오개입률 ≥ 10%는 추가 실증 대상으로 둡니다. 이 기준은
            포트폴리오용 가상 규칙입니다.
          </p>
          <h3>실증 및 추가 검토</h3>
          <p>
            반복 고객·고장·보안·지원 인력 변화·세금·기존 장비 계약은 실증과 별도
            계약 검토가 필요합니다. 매장 전체 당기순이익 또는 검증된 개선 효과를
            나타내지 않습니다.
          </p>
        </div>
      </details>
    </div>
  );
}
