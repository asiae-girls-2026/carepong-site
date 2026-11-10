# 케어퐁 사이트 (pillymon-site)

필리몽(Pillymon) 데스크탑 펫 앱의 **랜딩 페이지**와 **픽셀 펫 아트 워크숍** 레포.

- **라이브**: https://pillymon.vercel.app (프로덕션, 검색 차단 중)
- **앱 본체**: `desktop-pet` 레포 (Electron 데스크탑 다마고치)
- **진행 상태·결정 이력**: [STATE.md](STATE.md) ← 재개할 때 여기부터

## 폴더 구조

```
site/       ★ 배포되는 것 — 랜딩 index.html + sprites/ (정적, 빌드 없음)
preview/    로컬 실험실 — 픽셀 펫 작도 실험 뷰어들 (배포 안 됨)
            dot-32.html ★ 현재 유력안: 32px 네이티브 작도 뷰어
scripts/    픽셀 작도 스크립트 (draw-32, render-lib, trace-*, blink-* 등)
docs/       설계 문서 (랜딩 디자인 스펙)
```

## 랜딩 수정 & 배포

`site/index.html` 수정 후:

```bash
cd site && vercel --prod --yes
```

Vercel 프로젝트 `pillymon`에 이미 연결돼 있어 명령 한 줄로 끝. 검색 차단(noindex + robots.txt)이 걸려 있으니 정식 공개 시점에 해제할 것.

## 협업 규칙

- **main에 직접 푸시하지 않습니다.** 브랜치 → PR → 리뷰 1인 승인 → 머지 (팀 약속).
- `site/` 변경 PR은 머지 후 배포 필요 여부를 본문에 명시 (배포는 위 명령 한 줄).

## 픽셀 펫 아트 워크플로우 (정석 확정)

**32×32 네이티브로 직접 작도(8~16색) → nearest-neighbor 정수배(×4=128) → 표시.**

```bash
node scripts/draw-32.cjs        # 레포 루트에서 실행 → preview/px32/ 에 출력
open preview/dot-32.html        # 결과 확인 (로컬 파일로 바로 열림)
```

배경과 결론은 STATE.md의 "펫 아트 — 결론" 참고. 요지: 32px이 한 칸씩 통제 가능하면서도 표정·다리 표현이 되는 교집합이고, 다리가 분리돼야 진짜 걷기 애니메이션이 된다.
