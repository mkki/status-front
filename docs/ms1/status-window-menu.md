# 상태창 메뉴

> 본 문서는 기획 문서가 최소한의 스니펫만 남아있어, 주요 UI 구성 요소는 실제 구현 코드(`src/pages/status/`)를 참고.

## 1. 화면 구성

상태창 메뉴는 유저의 능력치 성장 상태를 한 화면에서 시각적으로 확인하는 1Depth Menu이다.

주요 영역:

- **상태창 헤더** (`status-header`): 유저 티어(통합 레벨) 정보
- **육각형 Radar 차트** (`radar-chart`): 정신/기술 능력치를 육각형으로 시각화, 탭으로 타입 전환
- **능력치 그리드** (`stat-grid`): 6종 능력치 타일 목록
- **티어 레벨 Bottom Sheet** (`tier-level-bottom-sheet`): 티어/레벨 상세
- **능력치 상세 Bottom Sheet** (`attribute-detail-bottom-sheet`): 개별 능력치 레벨/경험치 상세

## 2. 능력치 출력 방식

해당 attribute_id에 대한 유저의 현재 레벨을 출력한다.

출력 방법은 다음과 같다.

- 레벨:
    - Text: Lv. {0:d}
        - 0: 유저의 현재 해당 능력치 레벨
- 경험치:
    - Text: (레벨업까지 +{0:d}xp)
        - 0: '현재 해당 능력치 레벨에 해당하는 required_exp 값' - '현재 해당 능력치 레벨의 경험치 값'
            - required_exp는 해당 능력치의 type이 mentality or skill인지에 따라 각각 다음의 시트를 참조한다.
                - type = mentality: attributes_level_mentality 시트의 required_exp
                - type = skill: attributes_level_skill 시트의 required_exp
            - '현재 해당 능력치 레벨의 경험치 값'은 현재 레벨까지의 누적된 경험치 총량이 아닌, 현재 레벨에서만의 경험치임
                - e.g. 현재 3레벨 2exp라면, "(레벨업까지 +12exp)" 출력
