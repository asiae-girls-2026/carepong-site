# 필리몽(Pillymon) 사이트 — 진행 상태 메모

_업데이트: 2026-10-05_

## 링크/배포 현황 (2026-10-05)
- **이 레포는 이제 케어퐁(CarePong) 랜딩** — 필리몽 랜딩을 케어퐁 다운로드 사이트로 전면 개편.
- **배포 완료: https://carepong.vercel.app** (Vercel 새 프로젝트 `carepong`, 프로덕션, `site/` 정적 배포, noindex 유지)
- 구 주소 https://pillymon.vercel.app 는 옛 필리몽 내용 그대로 살아있음(프로젝트 `pillymon` 별도) — 내릴지 보류.
- 재배포: `cd ~/pillymon-site/site && vercel --prod --yes` (`.vercel/`이 carepong에 링크됨)
- **다운로드(10/5 저녁)**: 윈도우 설치본(102MB)은 Vercel 100MB 한도 초과 → **Vercel Blob**(스토어 carepong-files, public)으로 호스팅. URL: https://gzwbc89fomhmd1ao.public.blob.vercel-storage.com/CarePong-Setup-win-0.1.0.exe · 재업로드: `cd site && vercel blob put <파일> --access public --rw-token $(grep BLOB_READ_WRITE_TOKEN .env.local | cut -d'"' -f2)` (.env.local은 git/배포 제외). 맥 버튼은 '출시 예정' 토스트.
- 개편 내용: 카피 전부 케어퐁(스트레스 감지·1분 완화·알람4종·미니홈·하트 방꾸미기·펫 도감, 죽음 없음) / 캐릭터 3종 소개(검정 고양이·용가리·미스터리 박스) / 성장 5단계 = 디자인본 고양이 Lv.1~5.
- 스프라이트 파이프라인: `scripts/carepong_sprites.py` — `~/Desktop/케어퐁/디자인/`의 고양이1~5(베이지 격자 배경 플러드필 제거+Lv라벨 제거+트림), 용가리(트림+1/3 축소), 미스터리 박스(24px 직접 작도 ×12) → `site/sprites/cp-*.png`.

## 지금까지
- **앱(desktop-pet)**: 1차 마감 완료(태그 `app-1.0`). 별도 레포 `/Users/chaewon/desktop-pet`.
- **사이트(이 레포)**: 배포용 랜딩 설계 확정 → 픽셀 펫 아트 방식 탐색 중.
  - 설계 문서: `docs/superpowers/specs/2026-06-20-pillymon-landing-design.md`
  - 이름 **필리몽(Pillymon)**, 단일 롱스크롤, Next.js+Vercel(예정), 건강+귀여움, 다운로드 버튼은 자리만.

## 만들어 둔 시안/실험 (`preview/`)
- `../site/index.html` — 픽셀 다마고치 **랜딩**(히어로/기능/성장/스토리/CTA) — 배포됨(위 링크). `preview/`에서 이동함.
- `pet-lab.html` — 스프라이트→픽셀 변환 5단계 갤러리(우파루파/고양이).
- `hand-pet.html` — 손작도 옆모습(걷기 2프레임).
- `dot-pet.html` / `dot-sample.html` — 레퍼런스 트레이싱(64/128) + 윙크/통통걷기/반짝이.
- `dot-walk.html` — 손작도 옆모습 **진짜 다리걷기**.
- `dot-compare.html` — 트레이싱 vs 손작도 비교.
- **`dot-32.html` — ★현재 유력안: 32px 네이티브 워크플로우** (우파루파, 다리걷기+깜빡임, nearest ×4).

## 펫 아트 — 결론 (정석 확정)
**32×32 네이티브로 직접 작도(8~16색) → nearest-neighbor 정수배(×4=128) → 게임/사이트 표시.**
- 32px = 클로드가 한 칸씩 통제 가능 + 표정·실루엣·다리 표현 가능의 교집합.
- 다리가 분리돼 **진짜 다리걷기** 됨. 외곽선 깔끔. 전부 코드로 제어 → 애니·수정 자유.
- 스크립트(`scripts/`): `draw-32.cjs`(작도+프레임), `render-lib.cjs`(렌더), `trace-any.cjs`(이미지 트레이싱, 알파/흰배경), `blink-any.cjs`(눈깜빡임 검출).
- 검증법: 렌더 PNG를 직접 열어보고(Read) 수정 반복.

## 알게 된 것
- 정적 이미지 1장에서 **자동 다리걷기는 안 됨**(다리가 몸에 붙어 픽셀 밀면 글리치). 걷기는 ① 손작도(다리 분리) 또는 ② 걷기 프레임 2장 필요.
- 이미지 변환(다운스케일+양자화)은 디테일↑이지만 가장자리 거침·애니 어려움.
- GPT 이미지 API 연동도 가능(키 필요·유료·캐릭터 일관성 한계).

## 다음에 결정할 것 (사용자 고민 중)
1. 펫 스타일: **32px 직접 작도(유력)** vs GPT 트레이싱 vs 혼합.
2. 우파루파 1종 완성 굳히기 → 12종+교배종 확장 순서.
3. 사이트(랜딩) 본 구현 착수 시점(Next.js 스캐폴딩) — 펫 먼저냐 사이트 먼저냐.

## 재개 시
`open ~/pillymon-site/preview/dot-32.html` 부터 보면 현재 유력안 확인 가능.
