# 배포 상태와 실행 방법

## 2026-10-24 실제 확인
- production build와 로컬 production preview 접속·핵심 기능을 검증했다.
- 대상 저장소 Settings → Pages에서 **GitHub Pages is currently disabled**, Source=Deploy from a branch, Branch=None을 직접 확인했다.
- 따라서 공개 배포는 **[blocked] 저장소 Pages 활성화/배포 소스 설정이 필요**하다. 설정이나 권한을 임의 변경하지 않았다.
- 목표 URL https://hyollim.github.io/kioskflow-rescue/ 는 검증 없이 성공 주소로 표시하지 않는다. 실제 접속 결과는 실행 보고에 추가한다.

## 현재 가능한 데모
1. `deliverables/kioskflow-rescue-standalone.html`을 내려받아 브라우저로 연다. JS/CSS를 내장한 정적 단일 파일이며 서버·DB·API 없이 체험한다. 로컬 파일에서 저장을 차단하면 메모리로 동작한다.
2. Node 22.12+에서 `npm ci` → `npm run build` → `npm run preview -- --port 4173` → http://127.0.0.1:4173/kioskflow-rescue/.
3. 개발: `npm run dev`. 테스트: `npm test`. standalone 재생성: 빌드 후 `node scripts/make-standalone.mjs`.

## 변경 없이 준비한 CI
.github/workflows/validate.yml은 feature/autonomous-build push 또는 수동 실행에서 설치·테스트·빌드와 정적 artifact만 생성한다. contents:read만 선언하고 checkout 자격증명 저장을 끈다. main을 체크아웃/수정하거나 배포하지 않는다. 첫 원격 실행 성공 여부는 GitHub에서 확인 전까지 미검증이다.

## 추후 허용 시 Pages 경로
저장소 Pages 소스를 GitHub Actions로 활성화한 뒤 공식 Pages workflow를 검토한다. 배포 job에는 보통 pages:write, id-token:write가 필요하므로 현재 작업에서는 추가하지 않았다. main 병합 없이 feature 브랜치 빌드 dist를 artifact로 올리고 Pages 환경에 배포할 수 있는지 저장소 정책을 확인해야 한다. base는 /kioskflow-rescue/로 이미 설정했다. 공개 URL의 HTTP 응답·앱 로드·주문/분석 동작을 실제 검증한 뒤에만 배포 성공으로 보고한다.

## 로컬 파일 검증 한계와 대체 확인
Aside Browser는 로컬 file URL 탐색 권한이 없어 직접 파일 열기는 차단됐다. 이 권한은 변경하지 않았다. 같은 HTML을 프로젝트 한정 loopback 정적 서버로 제공해 실행을 검증하며, 원격 자산 없이 JS/CSS 내장 여부도 검사한다. file:// 직접 실행 성공까지 주장하지 않는다. `node scripts/serve-preview.mjs`는 dist/deliverables/screenshots 세 경로만 127.0.0.1:4174에 제공하며 Git·설정·소스 디렉터리는 제공하지 않는다.
- 목표 공개 URL을 실제 브라우저로 접속했으며 ‘Site not found · GitHub Pages’, 404를 확인했다. 공개 배포 성공으로 보고하지 않는다.
- 단일 HTML을 127.0.0.1:4174/deliverables/에서 열고 메뉴 클릭, C 옵션 오류 도움, 분석/사업성 전환·음수 시나리오가 동작함을 확인했다. file URL 직접 검증은 차단 상태다.

## 원격 CI 검증
9d11dc8의 Validate portfolio #1은 https://github.com/hyollim/kioskflow-rescue/actions/runs/40070606451 에서 Success(29초), test-and-build 및 정적 artifact 생성을 확인했다. Node20 action 경고는 최종 workflow에서 v5/Node24 및 ubuntu-24.04로 조정했다. CI 성공은 Pages 배포 성공과 다르다.

## Premium Enterprise Minimal 리디자인 검증
최종 13개 파일/103개 테스트와 production build, format 검사, 의존성 감사 0개를 확인했다. 단일 HTML은 JS/CSS/Pretendard/OFL을 내장한다. 별도 loopback origin의 HTTP 실행에서 기준/부정 손익 전환과 외부 runtime resource 0개를 확인했다. file:// 직접 실행과 공개 Pages 배포 성공은 주장하지 않는다. 비교 PDF·현재 제안서의 실제 화면과 디자인을 동기화했다. [상세](REDESIGN_REPORT.md)
