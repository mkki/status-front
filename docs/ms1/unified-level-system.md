# 통합 레벨 시스템

> ※ 임시 구현한다.
>
> 추후 통합 레벨의 사용처가 확정된 이후 구조 개편이 생길 가능성이 높다.

## 1. userlevel.xlsx

### [userlevel_step 시트]

| level | required_exp | grade | level_output |
| --- | --- | --- | --- |
| 1 | 2 | bronze | 1 |
| 2 | 2 | bronze | 2 |
| 3 | 2 | bronze | 3 |
| 4 | 2 | bronze | 4 |
| 5 | 2 | bronze | 5 |
| 6 | 2 | bronze | 6 |
| 7 | 2 | bronze | 7 |
| 8 | 2 | bronze | 8 |
| 9 | 2 | bronze | 9 |
| 10 | 3 | bronze | 10 |
| 11 | 3 | silver | 1 |
| 12 | 3 | silver | 2 |
| … | … | … | … |

**1) level**

기준이 되는 레벨이다.

- 현재 1~50까지로 구성한다.

**2) required_exp**

다음 레벨로 레벨업하기 위해 필요한 경험치 양이다.

레벨업을 위한 경험치는 **"attribute의 레벨업 시마다 +1"씩 획득**한다.

- e.g. 정신 능력치 1렙업 시 → 유저 레벨 경험치 +1 획득하게 됨

**3) grade**

현재 레벨일 때 해당되는 등급이다.

입력된 등급 값에 맞는 아이콘과 텍스트를 출력한다.

| enum | 텍스트 |
| --- | --- |
| bronze | Bronze |
| silver | Silver |
| gold | Gold |
| platinum | Platinum |
| dia | Dia |

**4) level_output**

화면 상에 보여지는 레벨 값이다.

입력된 값에 맞는 수치로 레벨 숫자를 출력한다.

## 2. 화면 출력

**1) 아이콘**

userlevel_step 시트의 'grade' 필드 참조

**2) 레벨 표기**

텍스트는 "[등급 텍스트] [레벨 값]" 형태로 출력한다.

- 등급 텍스트: userlevel_step 시트의 'grade' 필드 참조
- 레벨 값: userlevel_step 시트의 'level_output' 필드 참조
