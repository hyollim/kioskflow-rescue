import fs from "node:fs";
import crypto from "node:crypto";
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root));
const json = (p) => JSON.parse(read(p));
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const image = (p) => `data:image/png;base64,${read(p).toString("base64")}`;
const font = `@font-face{font-family:ReviewPretendard;src:url(data:font/woff2;base64,${read("public/fonts/PretendardVariable.woff2").toString("base64")}) format('woff2');font-weight:100 900}`;
const baseline = json("public/redesign/baseline.json");
const labels = {
  "kiosk-start": "키오스크 시작",
  "kiosk-start-detail": "키오스크 주문 화면",
  "kiosk-menu": "음료 메뉴",
  "kiosk-context-help": "C 모드 자동 도움 제안",
  dashboard: "운영 대시보드",
  "business-base": "사업성 분석 · 기준 가정",
};
const notes = {
  "kiosk-start":
    "실험 설정과 고객 주문 화면을 분리하고, 주문 시작 동작을 명확히 했습니다.",
  "kiosk-start-detail":
    "직접 작성한 음료 SVG와 따뜻한 종이색 화면, 차콜 CTA로 카페 주문 화면을 구분했습니다.",
  "kiosk-menu":
    "상품명·가격·카테고리를 정돈하고 카드 전체를 선택 영역으로 유지했습니다.",
  "kiosk-context-help":
    "온도 미선택·옵션 오류 시나리오의 동일한 자동 도움 제안입니다. 수락과 거절을 명확히 구분합니다.",
  dashboard:
    "동일한 합성 12세션입니다. A/B/C 완료율은 모두 75.0%이며 성능 개선의 근거가 아닙니다.",
  "business-base":
    "동일한 10대 운영 가정입니다. 월 순편익 +628,000원, 회수기간 4.8개월, ROI 151.2%를 보존했습니다.",
};
const pairs = baseline.captures.map((before) => {
  const p = `public/redesign/after/${before.file}`;
  const b = read(p);
  const widthPixels = b.readUInt32BE(16),
    heightPixels = b.readUInt32BE(20);
  if (
    widthPixels !== before.widthPixels ||
    heightPixels !== before.heightPixels
  )
    throw Error(`Capture dimensions differ: ${before.file}`);
  if (sha(read(`public/redesign/before/${before.file}`)) !== before.sha256)
    throw Error(`Baseline modified: ${before.file}`);
  const match = before.file.match(/^(.*)-(\d+)\.png$/);
  return {
    file: before.file,
    state: match[1],
    cssWidth: Number(match[2]),
    widthPixels,
    heightPixels,
    beforeSha256: before.sha256,
    afterSha256: sha(b),
  };
});
fs.writeFileSync(
  new URL("public/redesign/comparison.json", root),
  JSON.stringify(
    {
      baselineCommit: baseline.baselineCommit,
      method:
        "Actual production-app screenshots. Identical order/preset/filter states and CSS viewports; scrolling is normalized to the relevant area. Historical recent-event content may differ because QA appends events. No performance experiment or physical-device certification.",
      pairs,
    },
    null,
    2,
  ),
);
const pages = [];
const page = (title, body, subtitle = "") =>
  pages.push(
    `<section class="page"><header>KioskFlow Rescue <span>Premium Enterprise Minimal · UI/UX Review</span></header><h1>${title}</h1>${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}${body}<footer><span>개인 비공식 포트폴리오 · 실제 제품 UI 캡처 · 2026-10-24</span><span>${pages.length + 1}</span></footer></section>`,
  );
page(
  "정보와 판단이 먼저 보이는 운영 플랫폼",
  `<div class="intro"><p>화이트·뉴트럴 작업 공간과 따뜻한 카페 주문 화면을 분리했습니다. 기존 주문·지원 규칙·분석 수식은 유지하고, 정보 계층과 조작의 명확성을 개선했습니다.</p><div class="facts"><div><b>56</b><span>브라우저 검증 상태</span></div><div><b>103</b><span>통과 테스트</span></div><div><b>11쌍</b><span>동일 상태 비교</span></div></div></div><div class="pair cover-pair"><figure><figcaption>Before · 녹색 중심의 기존 UI</figcaption><img src="${image("public/redesign/before/dashboard-1440.png")}"/></figure><figure><figcaption>After · 뉴트럴 운영 대시보드</figcaption><img src="${image("public/redesign/after/dashboard-1440.png")}"/></figure></div><p class="note">실제 기업 운영 데이터를 의미하지 않습니다. 화면에 보이는 데이터는 명시한 합성 비교 데이터입니다.</p>`,
);
for (const p of pairs) {
  page(
    `${labels[p.state]} · ${p.cssWidth}px`,
    `<div class="pair ${p.cssWidth === 390 ? "mobile" : "desktop"}"><figure><figcaption>Before</figcaption><img src="${image(`public/redesign/before/${p.file}`)}"/></figure><figure><figcaption>After</figcaption><img src="${image(`public/redesign/after/${p.file}`)}"/></figure></div><p class="note">${notes[p.state]}</p>`,
    `${p.cssWidth} CSS px · 동일 기능 상태 · 원본 ${p.widthPixels}×${p.heightPixels}px`,
  );
}
page(
  "검증 결과와 남아 있는 한계",
  `<div class="summary"><article><h2>디자인 시스템</h2><p>배경 #F6F7F9 · 표면 #FFFFFF · 본문 #202733 · 보조 #596579 · 테두리 #E5E9F0 · 활성 #3158C8.</p><p>Pretendard Variable을 OFL 라이선스와 함께 자체 호스팅합니다. 화면 본문 최소 14px, 고객 주문 버튼 최소 44px, 입력과 버튼 높이를 통일했습니다.</p><h2>반복 개선</h2><ol><li>모바일 주문 시작 CTA의 하단 잘림을 수정했습니다.</li><li>장바구니 삭제 버튼을 44×44px로 확대했습니다.</li><li>모바일 손익 숫자·입력 단위·키보드 포커스 위치의 안정성을 개선했습니다.</li></ol></article><article><h2>기능과 증거</h2><p>전체 주문 완료, 옵션·결제 확인 오류, 수정·수량, B 수동 도움, 직원 호출 모의, C 6개 재현 시나리오, 수락·거절, 출처 필터와 키보드 표 스크롤을 실제 조작했습니다.</p><p>초기화는 비어 있는 별도 로컬 주소에 직접 만든 2개 이벤트로만 검사했습니다. 취소·Escape·포커스 순환·확인 후 0건 및 합성 12세션 보존을 확인했습니다.</p><h2>인증 또는 실증이 아님</h2><p>CSS 뷰포트 검사이며 물리 기기·모바일 OS·실제 스크린리더 검증은 아닙니다. axe 위반 0건과 판정불가 항목을 구분했습니다. 텍스트 대비 보조 측정 최소 4.82:1입니다.</p><p>복잡한 표는 의도적인 영역 내부 가로 스크롤을 유지합니다. 공개 Pages 배포와 file:// 직접 실행은 미검증/차단 상태입니다.</p></article></div>`,
);
const css = `${font}@page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;background:#f6f7f9;color:#202733;font-family:ReviewPretendard,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{position:relative;width:297mm;height:210mm;padding:32px 44px 46px;background:white;break-after:page;overflow:hidden}.page:last-child{break-after:auto}header{display:flex;justify-content:space-between;border-bottom:1px solid #e5e9f0;padding-bottom:13px;font-size:13px;font-weight:700}header span{color:#596579;font-weight:500}h1{font-size:29px;letter-spacing:-.035em;margin:21px 0 8px}h2{font-size:19px;margin:22px 0 9px}p,li{font-size:14px;line-height:1.65}.subtitle{margin:0 0 12px;color:#596579;font-size:13px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start}.pair figure{margin:0;min-width:0}.pair figcaption{font-size:14px;font-weight:650;margin:8px 0;color:#596579}.pair img{width:100%;height:auto;display:block;border:1px solid #e5e9f0;border-radius:6px}.desktop img{max-height:490px;object-fit:contain;object-position:top}.mobile{gap:70px;max-width:700px;margin:auto}.mobile img{height:500px;width:auto;max-width:100%;margin:auto}.mobile figcaption{text-align:center}.note{font-size:12px;color:#596579;margin:14px 0;line-height:1.6}.intro>p{max-width:970px}.facts{display:flex;gap:50px;margin:18px 0}.facts div{display:flex;gap:12px;align-items:center}.facts b{font-size:28px;color:#3158c8}.facts span{font-size:13px;color:#596579}.cover-pair img{max-height:330px;object-fit:contain;object-position:top}.summary{display:grid;grid-template-columns:1fr 1fr;gap:40px}.summary p,.summary li{font-size:14px}.summary ol{padding-left:20px}footer{position:absolute;left:44px;right:44px;bottom:23px;border-top:1px solid #e5e9f0;padding-top:9px;display:flex;justify-content:space-between;font-size:11px;color:#596579}@media screen{.page{margin:20px auto}}`;
const license = read("public/fonts/OFL-Pretendard.txt")
  .toString()
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;");
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>KioskFlow Rescue · Before / After UI Review</title><style>${css}</style><template id="pretendard-ofl-license">${license}</template></head><body>${pages.join("\n")}</body></html>`;
fs.writeFileSync(new URL("deliverables/redesign-review.html", root), html);
console.log(
  `Before/After review: ${pages.length} pages, ${pairs.length} dimension- and baseline-hash-verified pairs.`,
);
