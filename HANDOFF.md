# 인수인계 (HANDOFF) — 애드센스 사이트 프로젝트

> 다른 PC의 Claude Code로 이 프로젝트를 이어받을 때, **이 문서를 먼저 읽어주세요.**
> Claude의 메모리와 대화 기록은 PC마다 따로 저장돼서 넘어오지 않아요. 이 문서가 그 맥락을 대신합니다.

최종 업데이트: 2026-09-07

---

## 1. 이 프로젝트가 뭔가요

**Google 애드센스 승인**을 목표로 하는 **한국어 정보 콘텐츠 사이트**를 만듭니다.
`ppasak.net`(지인이 소수 포스팅으로 승인받은 사이트)의 **구조와 신뢰 장치를 벤치마킹**했어요.

핵심 전제(꼭 지킬 것):
- 승인의 관건은 글 개수가 아니라 **신뢰 장치**(저자 실체·3중 날짜·원문 검증 노트·면책·수익 고지)와 **편집 품질**.
- **AI 대량생산 티가 나면 거절.** 원문 직접 확인 + 해요체 톤 + 편집자 검수가 필수.
- 승인 전까지 **제휴 링크·백링크 금지**. 독립적으로 운영.
- YMYL(세금·법률·금융 등)이라도 신뢰 장치가 갖춰지면 승인 가능(벤치마킹 사이트가 그 사례).

---

## 2. 전체 구조

이 프로젝트는 **템플릿(base) 1개 + 개별 사이트 N개** 구조예요. 사이트마다 별도 GitHub 레포.

```
astro/
├─ base/            ← 공통 베이스 템플릿  (레포: appmong/astro_base) ← 지금 이 폴더
└─ sites/
   └─ n-league/     ← 뉴스리그 사이트     (레포: appmong/website01)
```

| 레포 | 용도 | 도메인(예정) |
|---|---|---|
| **github.com/appmong/astro_base** | 재사용 베이스 템플릿 | — |
| **github.com/appmong/website01** | 뉴스리그 (첫 테스트 사이트) | n-league.net |

> 계정: `appmong`. 인증은 HTTPS + Git Credential Manager(GCM).
> **새 PC에서는 첫 push 때 GitHub 로그인 창이 한 번 뜹니다**(그 뒤로는 캐시됨).

---

## 3. 새 PC에서 셋업하는 법

1. **Node.js 설치** (없으면):
   ```
   winget install OpenJS.NodeJS.LTS --source winget --accept-source-agreements --accept-package-agreements --silent
   ```
   > ⚠️ **Node ≥ 22.12.0 필수** (Astro 요구사항). node 20.x면 빌드가 `Node.js vXX is not supported by Astro!`로 실패해요.
   > winget LTS는 현재 24.x를 깔아줍니다. `--source winget`을 안 붙이면 msstore 동의 프롬프트에서 멈추니 위 플래그를 그대로 쓰세요.
   > 설치 중 관리자 권한(UAC) 창이 한 번 뜹니다.
   > **이미 낮은 버전 node로 `npm install`을 돌렸다면**, node 올린 뒤 `node_modules`를 지우고 재설치해야 합니다
   > (안 그러면 rolldown 네이티브 바이너리 `@rolldown/binding-*`를 못 찾아 빌드 실패). 명령: `rm -r node_modules && npm install`
2. **레포 clone** (원하는 위치에):
   ```
   git clone https://github.com/appmong/astro_base.git base
   git clone https://github.com/appmong/website01.git n-league
   ```
3. 각 폴더에서 **의존성 설치**:
   ```
   npm install
   ```
4. **`.claude/launch.json`의 node 경로 확인** — 지금은 메인 PC 기준으로
   `C:\Program Files\nodejs\node.exe` 절대경로가 박혀 있어요.
   새 PC의 Node 설치 위치가 다르면 이 경로를 고쳐야 미리보기가 됩니다.
   (Claude Code에게 "launch.json의 node 경로를 이 PC에 맞게 고쳐줘" 하면 됨)
5. **개발 서버 실행**:
   ```
   npm run dev        # http://localhost:4321
   ```

---

## 4. 기술 스택 & 핵심 파일

- **Astro** 정적 사이트 (SSR 아님) + `@astrojs/sitemap`, `@astrojs/rss`
- **Content Collections** + zod 스키마: `src/content.config.ts`
- URL 구조: `/{category}/{한글슬러그}/` (trailingSlash: always)

**설정은 `src/site.config.ts` 한 곳에서:**
- `SITE` — 이름·도메인·이메일·슬로건
- `VERIFICATION` — 구글/네이버 인증 메타값 (승인 단계에서 입력)
- `ADSENSE.clientId` — `ca-pub-XXXX` (승인 후 입력하면 광고 스크립트+ads.txt 자동 활성화)
- `AUTHORS` — 필명·경력 (저자 박스, **신뢰도 핵심**)
- `CATEGORIES` — 카테고리(니치)
- `FORTUNE_NOTES` / `NEWSLETTER` — 체류 위젯
- `EDITORIAL_PRINCIPLES` / `DISCLAIMERS` — 편집 원칙·면책

**신뢰 장치 컴포넌트** (`src/components/`):
TldrCard(결론부터) · MetaLine(3중 날짜+출처수) · Toc · VerifyNote(검증 노트) · AuthorBox · StatusBadge · DeadlineWidget(D-day) · RelatedPosts · Breadcrumb · PostCard

**체류/재방문 위젯**: FortuneNote(오늘의 쪽지) · SubscribeBox(구독폼, 데모모드) · ReadingProgress · BackToTop

**필수 페이지**: about / contact / privacy(쿠키·애드센스 고지) / terms / 404
**SEO 배관**: sitemap, rss.xml, robots.txt, ads.txt(동적)

**글 작성**: `src/content/posts/한글슬러그.md` 생성. 스키마는 `content.config.ts`,
견본은 `src/content/posts/재산세-이의신청-기한.md`(전체 구조 예시. 실제 발행 전 원문 확인 필수).

---

## 5. 새 사이트 하나 더 찍어내기

`base`에서 (자세히는 `USING-THIS-BASE.md`):
```
robocopy base sites\새사이트 /E /XD node_modules dist .astro .git
cd sites\새사이트
node scripts/new-site.mjs --name "사이트이름" --url "도메인.com"
npm install
```
→ `site.config.ts`·`astro.config.mjs`·`robots.txt`의 이름/도메인이 자동 주입됨.
그 뒤 새 GitHub 레포 만들어서 push.

---

## 6. 진행 상황 & 다음 단계

### 완료 ✅
- [x] 베이스 템플릿 완성 (컴포넌트·페이지·SEO·체류위젯), 클린 빌드
- [x] 찍어내기 스크립트(`scripts/new-site.mjs`)
- [x] 첫 사이트 "뉴스리그"(n-league.net) 생성·빌드·미리보기 검증
- [x] 두 레포 GitHub 업로드 (astro_base, website01)
- [x] 두 번째 사이트 "체크포인트 라이프"(cplife.co.kr, repo `appmong/website02`) 완성·배포 — Cloudflare Pages 자동배포, 검증 콘텐츠 15편, 애드센스/GA4/네이버 등록
- [x] **베이스 UI 고도화(2026-09-07)**: 헤더 검색·다크모드 토글, 히어로 검색바+인기칩(태그 자동), 포춘쿠키 오늘의 쪽지, 대표글 대형카드+카테고리별 섹션, Pretendard 웹폰트, 구조화데이터(Org·WebSite), theme-color·apple-touch-icon, OG 자동생성(`npm run og`). → 이후 찍어내는 사이트는 이 UI가 기본 탑재

### 남은 일 (우선순위 순)
- [ ] **니치 확정** — 지금 카테고리는 ppasak과 동일한 8개(정부지원금·세금·법률·금융·부동산·자동차·육아·연금) **플레이스홀더**. 겹치면 손해라 옆으로 트는 것 권장. `site.config.ts`의 `CATEGORIES`.
- [ ] **저자 프로필 확정** — 실제 경험을 걸 수 있는 필명·경력. `AUTHORS`.
- [ ] **도메인 구매** (n-league.net 등) + 네임서버 연결
- [ ] **배포** — Cloudflare Workers 정적 자산 호스팅 + GitHub Actions(`astro build` → `wrangler deploy`). 구독폼 백엔드는 Worker+KV로.
- [ ] **콘텐츠** — 검수한 글 20~30편(편당 1,500자+, 원문 확인). AI로 뼈대만, 사람이 도입/결론/검증.
- [ ] **Search Console·네이버 웹마스터** 등록 + 인증값 입력(`VERIFICATION`) + 사이트맵 제출
- [ ] **애드센스 신청** — 지급 프로필 먼저 채우기, `ADSENSE.clientId` 입력

---

## 7. 알아둘 함정 (gotchas)

- **node_modules는 git/복사에서 제외** — OS별 바이너리라 옮기면 깨짐. 항상 `npm install`로 새로. **단 `npm install`은 Node ≥22.12에서** 돌려야 rolldown 네이티브 바이너리가 제대로 받아짐(낮은 node로 받았으면 지우고 재설치).
- **미리보기 러너·bash에 node PATH가 없음** — `.claude/launch.json`은 `node.exe` 절대경로로 astro 실행. 새 PC에선 경로 확인.
- **Claude 메모리는 PC별** — 이 문서가 유일한 인수인계. 진행하면서 이 문서도 갱신하세요.
- **GCM 자격증명도 PC별** — 새 PC 첫 push 때 GitHub 로그인 창 1회.
- **미리보기 스크린샷**은 브라우저 pane이 화면에 떠 있어야 됨. 안 뜨면 `get_page_text`/`read_page`로 확인.
- 컴포넌트에서 "아무것도 렌더 안 함"은 `return Astro.response` 쓰지 말 것(`[object Object]` 출력됨). `{조건 && (...)}`로 감쌀 것.
