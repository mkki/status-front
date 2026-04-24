# 마이페이지 메뉴

> 본 문서는 기획 문서가 없어 실제 구현 코드(`src/pages/profile/`)를 기반으로 정리.

## 1. 화면 구성

마이페이지는 유저 프로필 정보와 계정 관리 액션을 제공하는 1Depth Menu이다.

헤더 Text: 마이

### 1.1 유저 프로필 (`UserProfile`)

- **프로필 이미지**: 기본 이미지 (디폴트 SVG)
- **닉네임**: `user.nickname` 출력
- **티어 표기**: `{tier}_{level}` 형태 (e.g. `bronze_1`) — 통합 레벨 시스템의 grade + level_output 조합
- **닉네임 수정 버튼**: 클릭 시 `NicknameEditBottomSheet` 출력

### 1.2 계정 액션 리스트 (`UserProfileActionList`)

유저 타입(일반/게스트)에 따라 다르게 출력:

| 항목 | 일반 유저 | 게스트 유저 |
| --- | --- | --- |
| 서비스 이용 약관 | 일반용 URL | 게스트용 URL |
| 개인정보 수집 및 이용 약관 | 일반용 URL | 게스트용 URL |
| 앱 버전 | 1.0.0 | 1.0.0 |
| 문의하기 | 공통 URL | 공통 URL |
| 로그인 액션 | 로그아웃 | 계정 연동 (소셜 연결) |
| 탈퇴 액션 | 회원탈퇴 | 게스트 모드 종료 |

### 1.3 외부 링크 처리

서비스 약관, 개인정보 약관, 문의하기 링크는 외부 브라우저로 열린다.

WebView 환경이면 `ReactNativeWebView.postMessage`로 `OPEN_EXTERNAL_BROWSER` 메시지 전달, 그렇지 않으면 `window.open(url, '_blank')`.

### 1.4 다이얼로그/바텀시트

- `NicknameEditBottomSheet`: 닉네임 편집
- `SignOutDialog`: 로그아웃 확인
- `WithdrawalDialog`: 회원 탈퇴 확인 (게스트면 "게스트 모드 종료")

## 2. 관련 구현

- 페이지: `src/pages/profile/profile-page.tsx`
- 상태: `@/features/auth/model/auth-store` (zustand)
- 게스트 판별: `user?.providerType === PROVIDER_TYPE.GUEST`
- WebView 브릿지: `@/shared/config/web-view` 의 `MESSAGE_TYPES.OPEN_EXTERNAL_BROWSER`
