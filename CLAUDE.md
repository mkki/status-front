# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

패키지 매니저는 pnpm입니다. Node 22 이상이 필요합니다(`.nvmrc` 참고).

- `pnpm dev` Vite 개발 서버. 브라우저를 자동으로 열고 `0.0.0.0`으로 바인딩합니다.
- `pnpm build` `tsc -b && vite build`. 전체 타입 체크가 함께 돌아가는 빌드 경로입니다.
- `pnpm type-check` `tsc --noEmit`만 수행.
- `pnpm lint`, `pnpm lint:fix` `src/**/*.{js,jsx,ts,tsx}` 대상.
- `pnpm lint:scss`, `pnpm lint:scss:fix` `**/*.scss` 대상 Stylelint.
- `pnpm format` Prettier.
- `pnpm storybook` 6006 포트 Storybook 개발 서버.
- `pnpm build-storybook` 정적 빌드. 결과는 `mkki.github.io/status-front`에 배포됩니다.

테스트 러너는 설정되어 있지 않습니다. `*.test.ts`, `*.spec.ts` 파일이 존재하지 않으므로 컴포넌트 검증은 Storybook과 브라우저 수동 확인으로 진행합니다.

Husky와 lint-staged가 pre-commit에서 동작합니다. TS/TSX는 ESLint와 Prettier, SCSS는 Stylelint, 그리고 변경 시점에 `tsc --noEmit`이 전체 프로젝트 단위로 한 번 더 실행됩니다.

## 환경 변수

`.env.sample`이 필요한 키 목록을 담고 있습니다. 모두 `VITE_` 접두사를 씁니다.

- `VITE_API_URL` 백엔드 베이스 URL.
- `VITE_API_MOCKING` 개발 빌드(`import.meta.env.DEV`)에서 문자열 `'true'`일 때만 `src/app/main.tsx`가 React 트리 마운트 전에 MSW 워커를 띄웁니다. 프로덕션 빌드에서는 값과 무관하게 무시되고 실제 API로 붙습니다.
- `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_REDIRECT_URI`
- `VITE_KAKAO_CLIENT_ID`, `VITE_KAKAO_REDIRECT_URI`
- `VITE_APPLE_CLIENT_ID`, `VITE_APPLE_REDIRECT_URI`

`.env.local`은 개발용, `.env.production`은 프로덕션 빌드용으로 커밋되어 있고 `https://api.devmkki.cloud/api/v1`을 가리킵니다.

## 아키텍처: Feature-Sliced Design

`src/` 아래 레이어는 의존 방향이 위에서 아래로만 흐릅니다. 위 레이어는 아래 레이어를 import 할 수 있지만 반대는 금지입니다.

`app/` → `pages/` → `widgets/` → `features/` → `entities/` → `shared/`

- `shared/` 프레임워크 비종속 프리미티브. `shared/ui/`(Button, BottomSheet, Dialog 등 SCSS Module + `classnames/bind`), `shared/api/`(fetch 클라이언트와 DTO), `shared/lib/`(date-fns 래퍼, 쿠키 헬퍼), `shared/config/paths.ts`(`PAGE_PATHS`), `shared/styles/utils/_mixins.scss`.
- `entities/` 도메인 모델과 읽기용 React Query 훅. `entities/{user,quest-template,user-quest}/{api,model,ui,config}/` 구조. `api/`에 `useGet*` 훅, `model/`에 DTO에서 파생된 타입 별칭.
- `features/` 사용자 단위 기능. `auth/`, `create-quest/`, `edit-nickname/`이 있고 Zustand 스토어와 Zod 스키마가 같은 폴더 안에 자리합니다(`features/{name}/model/{name}-store.ts`, `*-schema.ts`).
- `widgets/` 합성 UI. `bottom-navigation`, `global-header`, `attribute-detail-bottom-sheet`.
- `pages/` 라우트 단위 화면. 퀘스트 생성 멀티스텝은 `pages/quest-creation/step-*`로 단계마다 페이지가 분리되어 있습니다.
- `app/` 루트 컴포지션. `app/index.tsx`(QueryClientProvider), `app/main.tsx`(MSW 게이트 후 React 마운트), `app/providers/router-provider.tsx`(React Router v7 `createBrowserRouter`, lazy 페이지), `app/layouts/`(`RootLayout`, `PrivateLayout`, `BottomNavigationLayout`), `app/styles/global.scss`(CSS 변수 토큰), `app/mocks/`(MSW 워커와 핸들러).

### 경로 alias

`@/*`는 `src/*`로 매핑됩니다. `tsconfig.json`과 `vite.config.ts` 양쪽에 동일하게 설정되어 있습니다. 레이어를 가로지르는 import는 상대 경로 대신 `@/...` 형태로 작성합니다.

## 데이터 레이어

### API 클라이언트 (`src/shared/api/api-client.ts`)

fetch 래퍼이며 `api.get/post/put/patch/delete`를 노출합니다. 반환 타입은 `ApiResponse<T>`. `credentials: 'include'`로 동작하고, 401 응답이 오면 `authenticateUser()`와 `refreshAccessToken()`으로 토큰을 갱신한 뒤 원래 요청을 자동 재시도합니다. 새 엔드포인트는 이 클라이언트를 통해서만 호출하고 직접 `fetch`를 부르지 않습니다.

DTO 타입은 `shared/api/*.dto.ts`에 도메인별로 두고 entities의 `model/`에서 재노출합니다.

### React Query (`src/shared/api/query-client.ts`)

쿼리 기본값은 `staleTime: 60s`, `gcTime: 5m`, `retry: false`, `refetchOnWindowFocus: false`, `throwOnError: true`이고 mutations에도 `throwOnError: true`가 걸려 있습니다. 에러는 훅 단위에서 처리하지 않고 `react-error-boundary`까지 올라갑니다.

쿼리 키는 도메인 토큰으로 시작하는 튜플로 작성합니다. 예: `['quest', 'me']`, `['quest', 'themes', attributes]`, `['users', 'me']`, `['auth', 'me']`. 훅은 데이터를 소유한 레이어와 함께 둡니다. 엔티티 단위 읽기는 `entities/*/api/`, 기능 단위 변경은 `features/*/api/`, 페이지 전용 쿼리는 `pages/*/api/`에 위치합니다.

### MSW (`src/app/mocks/`)

워커 파일은 `public/mockServiceWorker.js`이며 `package.json`의 `msw.workerDirectory` 설정으로 관리됩니다. 핸들러는 도메인별로 `src/app/mocks/handler/{quest,auth,user,attribute}-handlers.ts`에 나뉘어 있고 `handlers.ts`에서 합칩니다. 모킹 데이터는 `src/app/mocks/data/`에 둡니다. 활성화는 `VITE_API_MOCKING=true`로 합니다.

## 상태 관리

Zustand 스토어는 `features/*/model/*-store.ts` 위치 규칙을 따릅니다.

- `useQuestCreationStore` (`features/create-quest/model/create-quest-store.ts`)는 멀티스텝 퀘스트 생성 흐름을 조율합니다. 상위 단계 선택을 바꾸면 의존하는 하위 선택(테마, 메인 퀘스트, 서브 퀘스트, 일정)이 같이 초기화되도록 setter가 캐스케이드 형태로 짜여 있습니다. 새 단계를 추가할 때 이 동작을 유지하세요.
- `useAuthStore` (`features/auth/model/auth-store.ts`)는 `pendingSocialUser`와 `user`를 들고 있고 일부 인접 스토어는 `persist` 미들웨어를 씁니다.

## 스타일

SCSS Module과 `classnames/bind` 조합을 씁니다.

```tsx
import classNames from 'classnames/bind';
import styles from './component.module.scss';
const cx = classNames.bind(styles);
// <div className={cx('root', { active }, className)} />
```

디자인 토큰은 `src/app/styles/global.scss`의 CSS 변수에 정의되어 있습니다. `--color-gray-*`, `--color-main-orange-*`, 그라디언트 토큰 `--color-gra-bg-*`, `--color-gra-line-*`, 상태 색 `--color-state-*`를 그대로 사용하고 hex 리터럴은 피합니다. 공용 mixin(`ellipsis`, `sr-only`, `placeholder-color`, `remove-scroll`)은 `src/shared/styles/utils/_mixins.scss`에 있습니다.

SVG는 `vite-plugin-svgr`을 거쳐 React 컴포넌트로 가져옵니다.

```ts
import IconStar from '@/shared/assets/icons/star.svg?react';
```

## 라우팅과 인증

- 라우트는 `src/app/providers/router-provider.tsx`에서 lazy 페이지 모듈로 선언합니다. 경로 문자열은 `src/shared/config/paths.ts`의 `PAGE_PATHS`에서 가져옵니다.
- `PrivateLayout`이 인증이 필요한 경로를 감쌉니다. 로그인, 가입, 소셜 연결 페이지는 `PrivateLayout` 바깥에 마운트됩니다.
- 메인 흐름은 `BottomNavigationLayout`으로 감쌉니다. status, quest, history, profile 네 화면이 여기에 들어갑니다.
- 퀘스트 생성 흐름은 `/quest/new/{attribute,theme,main-quest,sub-quest,schedule,result}` 라우트 시퀀스로 이루어져 있고 각 페이지가 `useQuestCreationStore`를 읽고 씁니다.

## 문서와 위키

기능 스펙은 `docs/ms1/`과 `docs/ms2/`에 마일스톤별로 정리되어 있습니다. ms1에는 인증, 상태창, 퀘스트 설정, 퀘스트 검증, 통합 레벨, 히스토리, 마이페이지 메뉴, 상태 시스템 스펙이 들어 있고 ms2에는 퀘스트 설정 시스템 개정이 있습니다. 새 기능을 만들거나 기존 흐름을 바꿀 때 먼저 해당 스펙을 읽고 작업합니다.

위키는 형제 디렉터리 `/Users/user/Documents/personal/status-front.wiki/`에 별도 클론으로 관리됩니다.

- [위키 동기화 정책](docs/wiki/wiki-sync-policy.md) 기능 개발이나 리팩토링이 끝나면 위키 관련 문서를 점검하고 업데이트를 제안하는 절차. 자동 커밋은 하지 않고 사용자 승인 후 반영합니다.
- [위키 개선 백로그](docs/wiki/wiki-improvements.md) 사용자 입력 또는 판단이 필요한 위키 개선 아이디어.
