# CarePong Site (carepong-site)

Landing / download page for **CarePong**, a desktop care-pet app that notices when you are stressed (keyboard & mouse rhythm) and guides you through a one-minute relief routine, plus the **pixel-pet art workshop** scripts used to draw its sprites.

- **Live site**: https://carepong.vercel.app (production, currently `noindex`)
- **App source**: `desktop-pet` repository (Electron desktop pet)
- **Project log / decisions**: [docs/STATE.md](docs/STATE.md)

[한국어 안내는 아래에 있습니다 → Korean version below](#케어퐁-사이트-carepong-site)

---

## Table of contents

1. [What is in this repo](#1-what-is-in-this-repo)
2. [Repository structure](#2-repository-structure)
3. [Runtime environment](#3-runtime-environment)
4. [Development environment](#4-development-environment)
5. [Getting started](#5-getting-started)
6. [Pixel-pet art workflow](#6-pixel-pet-art-workflow)
7. [Deployment](#7-deployment)
8. [Contributing](#8-contributing)
9. [License](#9-license)

## 1. What is in this repo

| Part | Purpose | Shipped? |
|------|---------|----------|
| `site/` | The landing page. A single static `index.html` with sprites and screenshots. No build step, no framework. | Yes, deployed to Vercel |
| `scripts/` | Node and Python scripts that draw, trace and animate the 32 px pixel pets and pre-process design assets. | No, dev tooling only |
| `preview/` | Local viewers (`*.html`) and rendered PNGs produced by the scripts, used to compare art options. | No, local lab only |
| `docs/` | Design spec and the running project log. | No |

The Windows installer linked from the landing page is **not** stored in this repo. It is hosted on Vercel Blob because it exceeds Vercel's 100 MB static-file limit.

## 2. Repository structure

```
carepong-site/
├── site/                     ★ deployed to Vercel (static, no build)
│   ├── index.html            landing page: hero / HOW TO / FEATURES / growth / CTA
│   ├── robots.txt            currently "Disallow: /" (remove at public launch)
│   ├── sprites/              character sprites used by the page (cp-*.png etc.)
│   └── shots/                app screenshots for the HOW TO section
├── scripts/                  pixel-art tooling (run from the repo root)
│   ├── render-lib.cjs        shared PNG renderer (palette grid → PNG at any scale)
│   ├── draw-32.cjs           ★ current workflow: hand-drawn 32×32 axolotl + walk/blink frames
│   ├── draw-axo.cjs          hand-drawn front view (preview/hand/)
│   ├── draw-side.cjs         hand-drawn side view with real leg walking
│   ├── trace-any.cjs         trace any image into an N×N pixel grid (CLI args)
│   ├── trace-hd.cjs / trace-big.cjs / trace64.cjs   older tracing experiments
│   ├── blink-any.cjs         detect eyes and generate a blink frame
│   ├── make-anim.cjs / make-walk.cjs / make-sample.cjs / side-walk.cjs / waddle-hd.cjs / walk-hd.cjs
│   │                         frame generators for earlier 64/128 px experiments
│   ├── pixelate.cjs          downscale + quantize reference art (preview/pixel/)
│   ├── carepong_sprites.py   pre-process designer PNGs → site/sprites/cp-*.png
│   └── requirements.txt      Python deps (Pillow)
├── preview/                  local viewers + outputs of the scripts above
│   ├── dot-32.html           ★ viewer for the 32 px workflow
│   ├── pet-lab.html, hand-pet.html, dot-*.html   other comparison viewers
│   └── px32/ hand/ dot/ pixel/   rendered PNGs
├── docs/
│   ├── STATE.md              project log and decisions (start here when resuming)
│   └── superpowers/specs/    landing design spec
├── .github/PULL_REQUEST_TEMPLATE.md
├── package.json              Node dev deps (pngjs) and npm scripts
├── LICENSE                   MIT (code) — see asset note inside
└── README.md
```

## 3. Runtime environment

**Landing page (`site/`)**

- Pure static HTML/CSS/JS, no server-side code and no build step.
- Any modern browser (Chrome, Edge, Safari, Firefox; desktop and mobile). Uses CSS grid, custom properties and `image-rendering: pixelated`.
- External resources loaded at runtime: Google Fonts (Press Start 2P, DotGothic16) and the Galmuri font from jsDelivr. No analytics, no cookies, no form submissions.
- Hosting: Vercel static deployment (project `carepong`). Installer file: Vercel Blob (public store `carepong-files`).

**CarePong app (what the download button delivers)**

- Windows 10 / 11, 64-bit. Installer `CarePong-Setup-win-<version>.exe` (~100 MB). The installer is not code-signed yet, so Windows SmartScreen may show a warning.
- macOS: coming soon (button shows a toast).

## 4. Development environment

| Tool | Version | Used for |
|------|---------|----------|
| Node.js | 18 or newer (tested on 24.x) | pixel-art scripts (`scripts/*.cjs`) |
| npm | comes with Node | installs `pngjs` |
| Python | 3.10 or newer (tested on 3.13) | `scripts/carepong_sprites.py` |
| Pillow | 10 or newer | image processing in the Python script |
| Vercel CLI | latest | deploying `site/` and uploading installers to Blob |
| Git + GitHub | any | branch → PR workflow |

OS: developed on macOS and Windows 11. Scripts use relative paths and run from the repository root on either.

Editing the landing page itself needs **nothing** beyond a text editor and a browser.

## 5. Getting started

```bash
git clone https://github.com/asiae-girls-2026/carepong-site.git
cd carepong-site

# landing page — just open it
open site/index.html          # macOS
start site\index.html         # Windows

# pixel-art scripts (optional)
npm install                   # installs pngjs
pip install -r scripts/requirements.txt   # Pillow, for the Python script
```

Run the current pixel workflow and view the result:

```bash
npm run draw:32               # = node scripts/draw-32.cjs → preview/px32/
open preview/dot-32.html
```

Other commands:

```bash
node scripts/trace-any.cjs <source.png> <out.png> [size=128]   # trace any image to pixels
node scripts/trace-hd.cjs  <source.png>                        # older 128 px tracer
python scripts/carepong_sprites.py <design-dir> [out-dir]       # designer PNGs → site/sprites/
```

`carepong_sprites.py` expects a folder containing `고양이1.png` … `고양이5.png` and `용가리.png` (the designer's originals). The output folder defaults to `site/sprites/`.

## 6. Pixel-pet art workflow

Decided approach (see `docs/STATE.md`, section "펫 아트 — 결론"):

**Draw at native 32×32 with 8–16 colours → scale by an integer factor with nearest-neighbour (×4 = 128 px) → display.**

Why 32 px: it is the smallest size at which a face, silhouette and *separate legs* can be expressed, while each pixel is still individually controllable from code. Separate legs are what make a real walking animation possible; a single static image cannot be auto-animated without glitches.

Palette grids live in `draw-*.cjs`; `render-lib.cjs` turns a grid into a PNG at any scale. Verify by opening the rendered PNGs, then iterate.

## 7. Deployment

The `site/` folder is linked to the Vercel project `carepong`. After merging a change to `site/index.html`:

```bash
cd site && vercel --prod --yes
```

Uploading a new installer to Vercel Blob (needs `BLOB_READ_WRITE_TOKEN` in `site/.env.local`, which is git-ignored and never deployed):

```bash
cd site && vercel blob put <file> --access public --rw-token "$(grep BLOB_READ_WRITE_TOKEN .env.local | cut -d'"' -f2)"
```

Then update the download `href` in `site/index.html`.

Search engines are currently blocked (`<meta name="robots" content="noindex">` + `robots.txt`). Remove both at public launch.

## 8. Contributing

- **No direct pushes to `main`.** Branch → pull request → one approving review → merge.
- Use the PR template. For `site/` changes, attach a screenshot and state whether a deploy is needed.
- New images go under `site/sprites/` or `site/shots/`; keep relative paths.
- Do not commit `.env*`, `.vercel/` or `node_modules/` (already git-ignored).

## 9. License

Code is released under the [MIT License](LICENSE).

Image assets (character sprites, pixel art, logo, app screenshots under `site/sprites/`, `site/shots/` and `preview/`) are **not** covered by MIT. They are © 2026 the CarePong team, all rights reserved. Fonts are loaded from their own CDNs under their own licenses (Press Start 2P and DotGothic16: SIL OFL; Galmuri: SIL OFL).

---
---

# 케어퐁 사이트 (carepong-site)

**케어퐁(CarePong)** 은 키보드·마우스 리듬으로 스트레스를 감지해 1분 완화 루틴으로 이어주는 데스크톱 케어펫 앱입니다. 이 레포는 그 앱의 **랜딩/다운로드 페이지**와, 스프라이트를 그릴 때 쓴 **픽셀 펫 아트 워크숍** 스크립트를 담고 있습니다.

- **라이브**: https://carepong.vercel.app (프로덕션, 현재 검색 차단 `noindex`)
- **앱 본체**: `desktop-pet` 레포 (Electron 데스크톱 펫)
- **진행 상태·결정 이력**: [docs/STATE.md](docs/STATE.md)

## 목차

1. [이 레포에 있는 것](#1-이-레포에-있는-것)
2. [레포 구조](#2-레포-구조)
3. [작동 환경](#3-작동-환경)
4. [개발 환경](#4-개발-환경)
5. [시작하기](#5-시작하기)
6. [픽셀 펫 아트 워크플로우](#6-픽셀-펫-아트-워크플로우)
7. [배포](#7-배포)
8. [협업 규칙](#8-협업-규칙)
9. [라이선스](#9-라이선스)

## 1. 이 레포에 있는 것

| 구성 | 역할 | 배포 여부 |
|------|------|-----------|
| `site/` | 랜딩 페이지. 정적 `index.html` 한 장 + 스프라이트·캡처 이미지. 빌드 없음, 프레임워크 없음. | 배포됨 (Vercel) |
| `scripts/` | 32px 픽셀 펫을 그리고·트레이싱하고·애니메이션 프레임을 만드는 Node/Python 스크립트. 디자인 원본 전처리 포함. | 배포 안 됨 (개발 도구) |
| `preview/` | 스크립트 결과를 비교해 보는 로컬 뷰어(`*.html`)와 렌더된 PNG. | 배포 안 됨 (로컬 실험실) |
| `docs/` | 설계 문서와 프로젝트 진행 로그. | 배포 안 됨 |

랜딩에서 연결되는 윈도우 설치본은 이 레포에 **없습니다**. Vercel 정적 파일 100MB 한도를 넘어서 Vercel Blob에 올려 두었습니다.

## 2. 레포 구조

```
carepong-site/
├── site/                     ★ Vercel에 배포되는 부분 (정적, 빌드 없음)
│   ├── index.html            랜딩: 히어로 / HOW TO / FEATURES / 성장 / CTA
│   ├── robots.txt            현재 "Disallow: /" (정식 공개 시 제거)
│   ├── sprites/              페이지에서 쓰는 캐릭터 스프라이트 (cp-*.png 등)
│   └── shots/                HOW TO 섹션용 앱 캡처
├── scripts/                  픽셀 아트 도구 (레포 루트에서 실행)
│   ├── render-lib.cjs        공용 PNG 렌더러 (팔레트 격자 → 원하는 배율 PNG)
│   ├── draw-32.cjs           ★ 현재 워크플로우: 32×32 손작도 우파루파 + 걷기/깜빡임 프레임
│   ├── draw-axo.cjs          손작도 정면 (preview/hand/)
│   ├── draw-side.cjs         손작도 옆모습, 다리 분리 걷기
│   ├── trace-any.cjs         아무 이미지나 N×N 픽셀 격자로 트레이싱 (CLI 인자)
│   ├── trace-hd.cjs / trace-big.cjs / trace64.cjs   예전 트레이싱 실험
│   ├── blink-any.cjs         눈 검출 → 깜빡임 프레임 생성
│   ├── make-anim.cjs / make-walk.cjs / make-sample.cjs / side-walk.cjs / waddle-hd.cjs / walk-hd.cjs
│   │                         64/128px 시절 프레임 생성기
│   ├── pixelate.cjs          레퍼런스 다운스케일+양자화 (preview/pixel/)
│   ├── carepong_sprites.py   디자이너 PNG 전처리 → site/sprites/cp-*.png
│   └── requirements.txt      Python 의존성 (Pillow)
├── preview/                  로컬 뷰어 + 위 스크립트의 출력물
│   ├── dot-32.html           ★ 32px 워크플로우 뷰어
│   ├── pet-lab.html, hand-pet.html, dot-*.html   기타 비교 뷰어
│   └── px32/ hand/ dot/ pixel/   렌더된 PNG
├── docs/
│   ├── STATE.md              진행 로그·결정 이력 (재개할 때 여기부터)
│   └── superpowers/specs/    랜딩 설계 문서
├── .github/PULL_REQUEST_TEMPLATE.md
├── package.json              Node 개발 의존성(pngjs)과 npm 스크립트
├── LICENSE                   MIT (코드) — 에셋 관련 주석 포함
└── README.md
```

## 3. 작동 환경

**랜딩 페이지 (`site/`)**

- 순수 정적 HTML/CSS/JS. 서버 코드 없음, 빌드 없음.
- 최신 브라우저 전부 (Chrome, Edge, Safari, Firefox; 데스크톱·모바일). CSS grid, 커스텀 속성, `image-rendering: pixelated` 사용.
- 런타임에 외부에서 불러오는 것: Google Fonts(Press Start 2P, DotGothic16), jsDelivr의 Galmuri 폰트. 분석 도구·쿠키·폼 전송 없음.
- 호스팅: Vercel 정적 배포(프로젝트 `carepong`). 설치 파일: Vercel Blob(public 스토어 `carepong-files`).

**케어퐁 앱 (다운로드 버튼이 주는 것)**

- Windows 10 / 11, 64비트. 설치본 `CarePong-Setup-win-<버전>.exe` (약 100MB). 아직 코드 서명이 안 돼 있어 SmartScreen 경고가 뜰 수 있습니다.
- macOS: 출시 예정 (버튼 클릭 시 토스트 안내).

## 4. 개발 환경

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | 18 이상 (24.x에서 확인) | 픽셀 아트 스크립트 (`scripts/*.cjs`) |
| npm | Node에 포함 | `pngjs` 설치 |
| Python | 3.10 이상 (3.13에서 확인) | `scripts/carepong_sprites.py` |
| Pillow | 10 이상 | Python 스크립트의 이미지 처리 |
| Vercel CLI | 최신 | `site/` 배포, 설치본 Blob 업로드 |
| Git + GitHub | 아무 버전 | 브랜치 → PR 워크플로우 |

OS: macOS와 Windows 11에서 개발했습니다. 스크립트는 상대경로를 쓰고 레포 루트에서 실행하면 어느 쪽에서든 동작합니다.

랜딩 페이지만 고칠 때는 텍스트 에디터와 브라우저 외에 **아무것도 필요 없습니다**.

## 5. 시작하기

```bash
git clone https://github.com/asiae-girls-2026/carepong-site.git
cd carepong-site

# 랜딩 페이지 — 그냥 열면 됩니다
open site/index.html          # macOS
start site\index.html         # Windows

# 픽셀 아트 스크립트 (선택)
npm install                   # pngjs 설치
pip install -r scripts/requirements.txt   # Python 스크립트용 Pillow
```

현재 픽셀 워크플로우 실행과 확인:

```bash
npm run draw:32               # = node scripts/draw-32.cjs → preview/px32/
open preview/dot-32.html
```

기타 명령:

```bash
node scripts/trace-any.cjs <원본.png> <출력.png> [크기=128]   # 아무 이미지나 픽셀로 트레이싱
node scripts/trace-hd.cjs  <원본.png>                        # 예전 128px 트레이서
python scripts/carepong_sprites.py <디자인폴더> [출력폴더]      # 디자이너 PNG → site/sprites/
```

`carepong_sprites.py`는 `고양이1.png` … `고양이5.png`, `용가리.png`(디자이너 원본)가 있는 폴더를 받습니다. 출력 폴더를 생략하면 `site/sprites/`에 저장합니다.

## 6. 픽셀 펫 아트 워크플로우

확정된 방식 (`docs/STATE.md`의 "펫 아트 — 결론" 참고):

**32×32 네이티브로 직접 작도(8~16색) → nearest-neighbor 정수배(×4 = 128px) → 표시.**

32px인 이유: 표정·실루엣·**분리된 다리**를 표현할 수 있는 가장 작은 크기이면서, 픽셀 한 칸씩 코드로 통제할 수 있는 크기입니다. 다리가 분리돼야 진짜 걷기 애니메이션이 되고, 정적 이미지 1장은 글리치 없이 자동 애니메이션이 안 됩니다.

팔레트 격자는 `draw-*.cjs`에 있고 `render-lib.cjs`가 격자를 원하는 배율의 PNG로 바꿉니다. 렌더된 PNG를 직접 열어 확인하며 반복합니다.

## 7. 배포

`site/` 폴더가 Vercel 프로젝트 `carepong`에 연결돼 있습니다. `site/index.html` 변경을 머지한 뒤:

```bash
cd site && vercel --prod --yes
```

새 설치본을 Vercel Blob에 올릴 때 (`site/.env.local`의 `BLOB_READ_WRITE_TOKEN` 필요, 이 파일은 git·배포에서 제외됨):

```bash
cd site && vercel blob put <파일> --access public --rw-token "$(grep BLOB_READ_WRITE_TOKEN .env.local | cut -d'"' -f2)"
```

그 다음 `site/index.html`의 다운로드 `href`를 갱신합니다.

현재 검색엔진 차단 중입니다 (`<meta name="robots" content="noindex">` + `robots.txt`). 정식 공개 시점에 둘 다 제거하세요.

## 8. 협업 규칙

- **main에 직접 푸시하지 않습니다.** 브랜치 → PR → 리뷰 1인 승인 → 머지.
- PR 템플릿을 사용합니다. `site/` 변경이면 스크린샷을 첨부하고 배포 필요 여부를 적습니다.
- 새 이미지는 `site/sprites/` 또는 `site/shots/`에 넣고 상대경로를 유지합니다.
- `.env*`, `.vercel/`, `node_modules/`는 커밋하지 않습니다 (이미 gitignore 처리됨).

## 9. 라이선스

코드는 [MIT 라이선스](LICENSE)입니다.

이미지 에셋(`site/sprites/`, `site/shots/`, `preview/`의 캐릭터 스프라이트·픽셀 아트·로고·앱 캡처)은 MIT에 **포함되지 않습니다**. © 2026 케어퐁 팀, All rights reserved. 폰트는 각 CDN에서 각자의 라이선스로 불러옵니다 (Press Start 2P, DotGothic16: SIL OFL / Galmuri: SIL OFL).
