# 퀘스트 설정 시스템 2.0

## 0. 개요

**[BackGround]**

MS2 폴리싱에서 UX 개선 논의에 따라 [MS1 - 퀘스트 설정 시스템 1.0]을 개선합니다.

**[정의]**

[<퀘스트 설정 시스템 1.0>]과 동일합니다.

## 1. quest.xlsx

파일: 2025.10.26

### #테이블 변경 사항

| Revision History |
| --- |
| 2025.10.25
- quest_config 시트에서 'select_attribute_num' 필드 삭제
- quest_mainquest 시트, quest_subquest 시트에서 다음의 필드 변경
    - link_type_[n]_id → reward_attribute_[n]_id
    - link_type_[n]_xp → reward_attribute_[n]_xp |

### #$definition

| sheet_name | field_name | unique_index_group | data_format | null | enum_type | $desc |
| --- | --- | --- | --- | --- | --- | --- |
| quest_config | field | 1 | string | FALSE |  | 변수명 입력 |
| quest_config | value |  | int | FALSE |  | 변수 값 입력 |
| quest_theme | theme_id | 1 | int | FALSE |  | 테마 고유 id |
| quest_theme | link_type_1_id |  | int | TRUE |  | 해당 능력치의 attribute_id |
| quest_theme | $link_type_1_name |  |  | TRUE |  | 해당 능력치의 attribute_name |
| quest_theme | link_type_2_id |  | int | TRUE |  | 해당 능력치의 attribute_id |
| quest_theme | $link_type_2_name |  |  | TRUE |  | 해당 능력치의 attribute_name |
| quest_theme | link_type_3_id |  | int | TRUE |  | 해당 능력치의 attribute_id |
| quest_theme | $link_type_3_name |  |  | TRUE |  | 해당 능력치의 attribute_name |
| quest_mainquest | theme_id | 1 | int | FALSE |  | 테마 고유 id |
| quest_mainquest | mainquest_id | 1 | int | FALSE |  | 메인 퀘스트 고유 id |
| quest_mainquest | quest_name |  | string | FALSE |  | 메인 퀘스트 이름 |
| quest_mainquest | link_type_1_id |  | int | TRUE |  | 해당 능력치의 attribute_id |
| quest_mainquest | $link_type_1_name |  |  | TRUE |  | 해당 능력치의 attribute_name |
| quest_mainquest | link_type_1_xp |  | int | TRUE |  | link_type_1_id의 경험치량 |
| quest_mainquest | link_type_2_id |  | int | TRUE |  | 해당 능력치의 attribute_id |
| quest_mainquest | $link_type_2_name |  |  | TRUE |  | 해당 능력치의 attribute_name |
| quest_mainquest | link_type_2_xp |  | int | TRUE |  | link_type_2_id의 경험치량 |
| quest_mainquest | mainquest_npc_name |  | string | FALSE |  | 메인 퀘스트를 제공하는 NPC 이름 |
| quest_subquest_1001to5001 | subquest_id |  | int | FALSE |  | 서브 퀘스트 고유 id |
| quest_subquest_1001to5001 | subquest_name |  | string | FALSE |  | 서브 퀘스트 이름 |
| quest_subquest_1001to5001 | action_unit_type |  | string | FALSE | time_second, time_minute, time_hour, number_1, number_2, number_3, distance, once | 서브 퀘스트의 출력 수행 횟수 Default 값이 정해진다. |
| quest_subquest_1001to5001 | target_mainquest_id |  | int | FALSE |  | 출력할 수 있는 메인퀘스트를 가리킨다. 입력된 값에 해당하는 mainquest_id일 때 본 subquest_id를 출력함 |
| quest_subquest_1001to5001 | link_type_1_id |  | int | TRUE |  | 해당 능력치의 attribute_id |
| quest_subquest_1001to5001 | $link_type_1_name |  |  | TRUE |  | 해당 능력치의 attribute_name |
| quest_subquest_1001to5001 | link_type_1_xp |  | int | TRUE |  | link_type_1_id의 경험치량 |
| quest_subquest_1001to5001 | link_type_2_id |  | int | TRUE |  | 해당 능력치의 attribute_id |
| quest_subquest_1001to5001 | $link_type_2_name |  |  | TRUE |  | 해당 능력치의 attribute_name |
| quest_subquest_1001to5001 | link_type_2_xp |  | int | TRUE |  | link_type_2_id의 경험치량 |
| quest_subquest_1001to5001 | confirm_type |  | string | FALSE | mood_log | 서브 퀘스트 인증 시 출력하는 화면 타입 |

### #quest_config

| field | value |
| --- | --- |
| quest_num | 3 |
| output_theme_num | 4 |
| output_mainquest_num | 4 |
| output_subquest_num | 4 |
| select_subquest_num | 3 |

- quest_num: 유저가 한번에 진행할 수 있는 최대 **메인** 퀘스트 수
- output_theme_num: [테마 선택]화면에서 출력되는 theme_id 개수
- output_mainquest_num: [메인 퀘스트 선택]화면에서 출력되는 mainquest_id 개수
- output_subquest_num: [서브 퀘스트 선택]화면에서 출력되는 mainquest_id 개수
- select_subquest_num: [서브 퀘스트 선택]화면에서 유저가 선택할 수 있는 서브 퀘스트 수

### #quest_theme

| theme_id | theme_name |
| --- | --- |
| 1 | 디지털 사용 절제 |
| 2 | 건강 루틴 |
| 3 | 의사소통 훈련 |
| 4 | 배우는 습관 갖기 |
| 5 | 새로운 시도 도전 |
| 6 | 아침 루틴 정착 |
| 7 | 수면 습관 개선 |
| 8 | 소비 절제 |
| 9 | 감정 표현력 향상 |
| 10 | 생각 정리 |
| 11 | 논리적인 사고 |
| 12 | 스포츠 취미 발견 |
| 13 | 내 취향 탐색 |
| 14 | 여행 계획 |
| 15 | 요리하기 |

- theme_id를 랜덤하게 output_theme_num 만큼 화면에 출력합니다.

### #quest_mainquest

※ 수가 많아 일부만 참고차 기재합니다.

| mainquest_id | mainquest_name | target_theme_id | reward_attribute_1_id | $reward_attribute_1_name | reward_attribute_1_xp | reward_attribute_2_id | $reward_attribute_2_name | reward_attribute_2_xp | mainquest_npc_name |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1001 | 스마트폰 사용 패턴 분석하기 | 1 | 203 | 기록 | 100 | 103 | 제어 | 50 | 패턴의 기록자 |
| 1002 | 디지털 방해 없는 고정 시간 정하기 | 1 | 102 | 집중 | 100 | 103 | 제어 | 50 | 몰입의 수호자 |
| 1003 | 내 디지털 습관 파악하기 | 1 | 203 | 기록 | 100 | 103 | 제어 | 50 | 행동의 조율자 |
| 1004 | 집중을 방해하는 앱 목록 정리하기 | 1 | 102 | 집중 | 100 | 103 | 제어 | 50 | 방해의 추적자 |
| 1005 | 내 디지털 알림 패턴 분석하기 | 1 | 203 | 기록 | 100 | 102 | 집중 | 50 | 패턴의 기록자 |
| 1006 | 휴대폰 없이 몰입할 공간 만들기 | 1 | 103 | 제어 | 100 | 102 | 집중 | 50 | 환경의 설계자 |
| 2001 | 스트레칭 습관 만들기 | 2 | 201 | 건강 | 100 | 105 | 성실 | 50 | 유연의 수련자 |

- 앞선 [테마 선택]화면에서 유저가 선택한 theme_id에 해당하는 것을 랜덤하게 output_mainquest_num개 출력합니다.

### #quest_subquest

| subquest_id | subquest_name | action_unit_type | target_mainquest_id | reward_attribute_1_id | $reward_attribute_1_name | reward_attribute_1_xp | reward_attribute_2_id | $reward_attribute_2_name | reward_attribute_2_xp | confirm_type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10001 | 기상 후 {0:d}분 동안 스마트폰 잠금 모드 유지하기 | time_minute | 1001 | 103 | 제어 | 7 | 102 | 집중 | 5 | mood_log |
| 10002 | 스마트폰 사용 전 사용 목적 생각하기 | once | 1001 | 103 | 제어 | 5 | 102 | 집중 | 3 | mood_log |
| 10003 | 스마트폰 사용 시간 체크 후 느낀점 남기기 | once | 1001 | 203 | 기록 | 5 | 103 | 제어 | 3 | mood_log |
| 10004 | 하루 중 스마트폰 사용 시간 파악하기 | once | 1001 | 203 | 기록 | 5 | 103 | 제어 | 3 | mood_log |
| 10005 | 불필요한 앱 삭제 리스트 만들어 삭제하기 | once | 1004 | 103 | 제어 | 6 | 102 | 집중 | 4 | mood_log |
| 10006 | 앱 별 사용 시간 정리하기 | once | 1001 | 203 | 기록 | 5 | 103 | 제어 | 3 | mood_log |
| 10007 | 디지털 차단 앱 설치 및 사용 스크린샷 찍기 | once | 1006 | 103 | 제어 | 6 | 102 | 집중 | 4 | mood_log |

- subquest_id는 중복 아이디가 가능합니다. 각 subquest_id는 target_mainquest_id에 해당하는 메인 퀘스트에 등장할 수 있습니다.
- action_unit_type에 따라 서브 퀘스트 출력 시 수행 횟수 Default 출력과 유저가 수정하기 시 입력 가능한 숫자 범위가 달라집니다.
- confirm_type은 추후 MS2 때 photo_log 타입 개발 이후 수정합니다.

## 2. 퀘스트 생성

**※ 1.0과 동일합니다.**

유저는 퀘스트를 동시에 최대 quest_config 시트의 'quest_num' 값 만큼 보유할 수 있다.

## 3. 퀘스트 메뉴

**※ 1.0과 동일합니다.**

상세 내용은 [team-phase/quest-setup-system.md] 참조.

## 4. 퀘스트 만들기 - 능력치 선택 화면

본 [능력치 선택 화면]은 **삭제한다**. (2.0의 가장 큰 변경점)

## 5. 퀘스트 만들기 - 테마 선택 화면

본 화면에서는 quest_theme 시트의 'theme_id'를 랜덤으로 output_theme_num개 출력한다.

1.0과 달리 **능력치 매칭 조건이 제거**되었다. 모든 테마를 동일 확률로 랜덤 출력.

### 5.1 뒤로가기 버튼

클릭 시 [퀘스트] 메뉴를 출력한다.

### 5.2 타이틀

**※ 1.0과 동일합니다.**

Text: 퀘스트 만들기

### 5.3 가이드 텍스트(1)

**※ 1.0과 동일합니다.**

Text: 시도하고 싶은 테마를 선택하세요!

### 5.4 가이드 텍스트(2)

(2.0에서 제거됨: 이전의 "{능력치}를 성장시킬 수 있는 테마를 추천해드렸어요" 가이드 제거)

### 5.5 ~ 5.7 테마 목록, 리롤, 다음 버튼

**※ 1.0과 동일합니다.**

## 6. 퀘스트 만들기 - 메인 퀘스트 선택 화면

### 6.5.1 메인 퀘스트 출력

출력 가능한 메인 퀘스트의 조건은 다음 조건을 만족하는 mainquest_id이다.

- quest_mainquest 시트에서 유저가 선택한 테마의 theme_id와 일치하는 mainquest_id를 출력한다.
- **(규칙 제거)** 기존 1.0의 "link_type_1_id, link_type_2_id 에 입력된 attribute_id 값 중 유저가 선택한 능력치 모두를 갖는 mainquest_id" 조건 제거.

나머지 로직(랜덤 4개, 중복 제외, 리롤 쿨타임, 진행 중인 퀘스트 제외)은 1.0과 동일.

## 7. 퀘스트 만들기 - 서브 퀘스트 선택 화면

### 7.5.1 서브 퀘스트 출력

출력 가능한 서브 퀘스트의 조건은 다음 조건을 만족하는 subquest_id이다.

- quest_subquest 시트에서 유저가 선택한 mainquest_id와 일치하는 target_mainquest_id의 값을 가지는 subquest_id를 출력한다.
- **(규칙 제거)** 기존 1.0의 "link_type_1_id, link_type_2_id 에 입력된 attribute_id 값 중 유저가 선택한 능력치를 모두 가지는 subquest_id" 조건 제거.

### 7.5.5 서브 퀘스트 보상

필드명 변경 반영:

- link_type_[n]_id → reward_attribute_[n]_id
- link_type_[n]_xp → reward_attribute_[n]_xp

나머지 가중치 계산 공식은 1.0과 동일.

## 8. 퀘스트 만들기 - 수행 기간 설정 화면

**※ 1.0과 동일합니다.**

## 9. 퀘스트 만들기 - 퀘스트 생성 완료 화면

메인 퀘스트 보상 출력 시 필드명만 `reward_attribute_[n]_*` 로 변경. 나머지는 1.0과 동일.

## 10. 공통

**※ 1.0과 동일합니다.**

## 변경 요약 (1.0 → 2.0)

| 항목 | 1.0 | 2.0 |
| --- | --- | --- |
| 플로우 스텝 | 5단계 (능력치 → 테마 → 메인 → 서브 → 기간) | 4단계 (테마 → 메인 → 서브 → 기간) |
| 능력치 선택 화면 | 있음 | **삭제** |
| 필드명 | link_type_[n] | reward_attribute_[n] |
| 테마 출력 조건 | 선택한 능력치 기반 필터 | 전체 랜덤 |
| 메인 퀘스트 출력 조건 | 테마 일치 + 능력치 매칭 | 테마 일치만 |
| 서브 퀘스트 출력 조건 | 메인 일치 + 능력치 매칭 | 메인 일치만 |
| quest_config | select_attribute_num 포함 | 해당 필드 제거 |
