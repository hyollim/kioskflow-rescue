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
          <span className="eyebrow">03 / BUSINESS FEASIBILITY LAB</span>
          <h1>
            좋은 경험이,
            <br />
            <span>좋은 사업이 되려면.</span>
          </h1>
          <p>
            거래 회복과 운영 절감, 그리고 도입 비용까지.
            <br />
            고객사 관점의 증분 손익을 가정으로 검토합니다.
          </p>
        </div>
        <div className="analysis-badge">
          <Icon name="chart" size={19} /> 원 / 월 기준 손익
          <small>실측 성과가 아닌 가상 가정</small>
        </div>
      </div>
      <div className="business-warning">
        <strong>모든 입력값은 임의 설정한 가상 가정입니다.</strong>
        <p>
          실제 NICE 제품 가격, 고객사 실적 또는 개선 효과가 아닙니다.
          세금·금융비용·계절성은 제외한 단순 모델이며, 실제 도입 전 실증과
          견적이 필요합니다.
        </p>
      </div>
      <div className="preset-grid" aria-label="사업성 시나리오">
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
      <div className="business-layout">
        <section className="panel inputs-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR ASSUMPTIONS</span>
              <h2>도입 조건을 바꿔 보세요.</h2>
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
        <div className="business-results" aria-live="polite">
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
                  <span className="eyebrow">
                    MODEL-BASED DECISION · 실증 전
                  </span>
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
                  <small>
                    권고 기준은 포트폴리오용 가상 의사결정 규칙입니다.
                  </small>
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
                  <span className="eyebrow">INCREMENTAL PROFIT BRIDGE</span>
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
                  <span className="eyebrow">BEFORE / AFTER · HYPOTHETICAL</span>
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
      <div className="methodology-strip">
        <div>
          <span>01 / MEASURE FIRST</span>
          <h3>가정의 크기보다 근거의 질.</h3>
          <p>
            현재 이탈률·회복률·호출비는 실측 전입니다. 실제 관측치와 통합 견적을
            입력해야 도입 판단에 사용할 수 있습니다.
          </p>
        </div>
        <div>
          <span>02 / NEGATIVE CASE</span>
          <h3>좋지 않은 결과도 의사결정.</h3>
          <p>
            순편익 ≤ 0 또는 오개입률 ≥ 20%는 보류. 회수기간 &gt; 12개월 또는
            오개입률 ≥ 10%는 추가 실증 대상으로 둡니다.
          </p>
        </div>
        <div>
          <span>03 / LIMITED MODEL</span>
          <h3>단순 모델의 밖도 확인.</h3>
          <p>
            반복 고객·계절성·고장·보안·지원 인력 변화·세금·기존 장비 계약은 실제
            실증과 별도 계약 검토가 필요합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
