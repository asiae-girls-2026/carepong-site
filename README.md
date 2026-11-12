# CarePong Site

Landing / download page for **CarePong**, a desktop care-pet app, and the pixel-art scripts behind its characters.

> **Note**: This repository is the **landing page** (introduction + download) for CarePong, **not the app itself**. The app source lives in the separate `desktop-pet` repository.
>
> 이 레포는 케어퐁 앱의 **랜딩 페이지**(소개·다운로드)이며, **앱 본체가 아닙니다**. 앱 소스는 별도 `desktop-pet` 레포에 있습니다.

🌐 **Live**: https://carepong.vercel.app

**Language**: [English](#english) · [한국어](#한국어)

---

## English

### Overview

- **CarePong** is a desktop care-pet app
  - Detects stress from your keyboard & mouse rhythm
  - Guides you through a one-minute relief routine
  - Pet grows as you take care of yourself (medication, water, stress)
- **This repository** contains
  - The landing / download page (`site/`)
  - Pixel-pet art scripts used to draw the characters (`scripts/`)
  - Local viewers for comparing art options (`preview/`)
- **The app itself** lives in a separate `desktop-pet` repository (Electron)

### Repository structure

```
carepong-site/
├── site/                 ★ the landing page (static, no build step)
│   ├── index.html        hero / HOW TO / FEATURES / growth / download
│   ├── sprites/          character sprites used by the page
│   └── shots/            app screenshots
├── scripts/              pixel-art tooling (run from repo root)
│   ├── render-lib.cjs    shared PNG renderer (palette grid → PNG)
│   ├── draw-32.cjs       ★ current workflow: hand-drawn 32×32 pet + walk/blink frames
│   ├── draw-axo.cjs      hand-drawn front view
│   ├── draw-side.cjs     hand-drawn side view with real leg walking
│   ├── trace-any.cjs     trace any image into an N×N pixel grid
│   ├── trace-*.cjs       older tracing experiments
│   ├── make-*.cjs        animation frame generators (64 / 128 px era)
│   ├── blink-any.cjs     detect eyes → blink frame
│   ├── pixelate.cjs      downscale + quantize reference art
│   ├── carepong_sprites.py   pre-process designer PNGs → site/sprites/
│   └── requirements.txt  Python deps
├── preview/              local viewers + rendered PNGs
│   └── dot-32.html       ★ viewer for the 32 px workflow
├── docs/                 design spec + project log
├── package.json          Node dev deps + npm scripts
├── LICENSE
└── README.md
```

### Runtime environment

- **Landing page**
  - Static HTML / CSS / JS only, no server, no build
  - Works in any modern browser (Chrome, Edge, Safari, Firefox / desktop & mobile)
  - Loads fonts from Google Fonts and jsDelivr (Press Start 2P, DotGothic16, Galmuri)
  - No analytics, no cookies, no forms
  - Hosted on Vercel
- **CarePong app (download)**
  - Windows 10 / 11, 64-bit
  - macOS: coming soon

### Development environment

| Tool | Version | Used for |
|------|---------|----------|
| Node.js | 18+ (tested on 24) | pixel-art scripts (`scripts/*.cjs`) |
| npm | bundled with Node | installs `pngjs` |
| Python | 3.10+ (tested on 3.13) | `scripts/carepong_sprites.py` |
| Pillow | 10+ | image processing in the Python script |

- Developed on macOS and Windows 11
- All scripts use relative paths and run from the repository root
- Editing the landing page needs only a text editor and a browser

### Getting started

```bash
git clone https://github.com/asiae-girls-2026/carepong-site.git
cd carepong-site
```

- **View the landing page**
  - macOS: `open site/index.html`
  - Windows: `start site\index.html`
- **Run the pixel-art scripts** (optional)
  ```bash
  npm install                                # pngjs
  pip install -r scripts/requirements.txt    # Pillow
  npm run draw:32                            # → preview/px32/
  open preview/dot-32.html                   # view the result
  ```
- **Other commands**
  ```bash
  node scripts/trace-any.cjs <source.png> <out.png> [size=128]
  node scripts/trace-hd.cjs  <source.png>
  python scripts/carepong_sprites.py <design-dir> [out-dir]   # default out: site/sprites/
  ```

### Pixel-pet art workflow

- **Rule**: draw at native 32×32 (8–16 colours) → nearest-neighbour integer scale (×4 = 128 px) → display
- **Why 32 px**
  - Smallest size that still shows a face, silhouette and *separate legs*
  - Every pixel stays controllable from code
  - Separate legs make a real walking animation possible
- **Where things are**
  - Palette grids: `scripts/draw-*.cjs`
  - Renderer: `scripts/render-lib.cjs`
  - Check results by opening the PNGs in `preview/`

### Contributing

- Branch → pull request → one approving review → merge (no direct pushes to `main`)
- Use the PR template; attach a screenshot for `site/` changes
- New images go under `site/sprites/` or `site/shots/`
- Never commit `.env*`, `.vercel/` or `node_modules/`

### License

- Code: [MIT](LICENSE)
- Image assets (sprites, pixel art, logo, screenshots): © 2026 CarePong team, all rights reserved. Not covered by MIT.
- Fonts: loaded from their own CDNs under the SIL Open Font License

---

## 한국어

### 개요

- **케어퐁(CarePong)** 은 데스크톱 케어펫 앱
  - 키보드·마우스 리듬으로 스트레스를 감지
  - 1분 완화 루틴으로 안내
  - 약·물·스트레스를 챙길수록 펫이 성장
- **이 레포**에 있는 것
  - 랜딩 / 다운로드 페이지 (`site/`)
  - 캐릭터를 그리는 픽셀 아트 스크립트 (`scripts/`)
  - 아트 시안 비교용 로컬 뷰어 (`preview/`)
- **앱 본체**는 별도 `desktop-pet` 레포 (Electron)

### 레포 구조

```
carepong-site/
├── site/                 ★ 랜딩 페이지 (정적, 빌드 없음)
│   ├── index.html        히어로 / HOW TO / FEATURES / 성장 / 다운로드
│   ├── sprites/          페이지에서 쓰는 캐릭터 스프라이트
│   └── shots/            앱 캡처
├── scripts/              픽셀 아트 도구 (레포 루트에서 실행)
│   ├── render-lib.cjs    공용 PNG 렌더러 (팔레트 격자 → PNG)
│   ├── draw-32.cjs       ★ 현재 워크플로우: 32×32 손작도 펫 + 걷기/깜빡임 프레임
│   ├── draw-axo.cjs      손작도 정면
│   ├── draw-side.cjs     손작도 옆모습, 다리 분리 걷기
│   ├── trace-any.cjs     아무 이미지나 N×N 픽셀 격자로 트레이싱
│   ├── trace-*.cjs       예전 트레이싱 실험
│   ├── make-*.cjs        애니메이션 프레임 생성기 (64 / 128px 시절)
│   ├── blink-any.cjs     눈 검출 → 깜빡임 프레임
│   ├── pixelate.cjs      레퍼런스 다운스케일 + 양자화
│   ├── carepong_sprites.py   디자이너 PNG 전처리 → site/sprites/
│   └── requirements.txt  Python 의존성
├── preview/              로컬 뷰어 + 렌더된 PNG
│   └── dot-32.html       ★ 32px 워크플로우 뷰어
├── docs/                 설계 문서 + 진행 로그
├── package.json          Node 개발 의존성 + npm 스크립트
├── LICENSE
└── README.md
```

### 작동 환경

- **랜딩 페이지**
  - 정적 HTML / CSS / JS만 사용, 서버·빌드 없음
  - 최신 브라우저 전부 지원 (Chrome, Edge, Safari, Firefox / 데스크톱·모바일)
  - 폰트는 Google Fonts와 jsDelivr에서 로드 (Press Start 2P, DotGothic16, Galmuri)
  - 분석 도구·쿠키·폼 없음
  - Vercel에 호스팅
- **케어퐁 앱 (다운로드)**
  - Windows 10 / 11, 64비트
  - macOS: 출시 예정

### 개발 환경

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 18 이상 (24에서 확인) | 픽셀 아트 스크립트 (`scripts/*.cjs`) |
| npm | Node에 포함 | `pngjs` 설치 |
| Python | 3.10 이상 (3.13에서 확인) | `scripts/carepong_sprites.py` |
| Pillow | 10 이상 | Python 스크립트의 이미지 처리 |

- macOS와 Windows 11에서 개발
- 모든 스크립트는 상대경로를 쓰고 레포 루트에서 실행
- 랜딩 페이지 수정은 텍스트 에디터와 브라우저만 있으면 됨

### 시작하기

```bash
git clone https://github.com/asiae-girls-2026/carepong-site.git
cd carepong-site
```

- **랜딩 페이지 보기**
  - macOS: `open site/index.html`
  - Windows: `start site\index.html`
- **픽셀 아트 스크립트 실행** (선택)
  ```bash
  npm install                                # pngjs
  pip install -r scripts/requirements.txt    # Pillow
  npm run draw:32                            # → preview/px32/
  open preview/dot-32.html                   # 결과 확인
  ```
- **기타 명령**
  ```bash
  node scripts/trace-any.cjs <원본.png> <출력.png> [크기=128]
  node scripts/trace-hd.cjs  <원본.png>
  python scripts/carepong_sprites.py <디자인폴더> [출력폴더]   # 출력 기본값: site/sprites/
  ```

### 픽셀 펫 아트 워크플로우

- **원칙**: 32×32 네이티브로 작도(8~16색) → nearest-neighbor 정수배(×4 = 128px) → 표시
- **32px인 이유**
  - 표정·실루엣·*분리된 다리*를 표현할 수 있는 가장 작은 크기
  - 픽셀 한 칸씩 코드로 통제 가능
  - 다리가 분리돼야 진짜 걷기 애니메이션이 됨
- **위치**
  - 팔레트 격자: `scripts/draw-*.cjs`
  - 렌더러: `scripts/render-lib.cjs`
  - 결과 확인: `preview/`의 PNG를 직접 열어 보기

### 협업 규칙

- 브랜치 → PR → 리뷰 1인 승인 → 머지 (`main` 직접 푸시 금지)
- PR 템플릿 사용, `site/` 변경 시 스크린샷 첨부
- 새 이미지는 `site/sprites/` 또는 `site/shots/`에
- `.env*`, `.vercel/`, `node_modules/`는 커밋하지 않음

### 라이선스

- 코드: [MIT](LICENSE)
- 이미지 에셋(스프라이트·픽셀 아트·로고·캡처): © 2026 케어퐁 팀, All rights reserved. MIT 미포함.
- 폰트: 각 CDN에서 SIL Open Font License로 로드
