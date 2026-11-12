# CarePong Site

Landing / download page for **CarePong**, a desktop care-pet app.

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
  - A helper script that prepares the character sprites (`scripts/`)
  - The original design spec (`docs/`)
- **The app itself** lives in a separate `desktop-pet` repository (Electron)

### Repository structure

```
carepong-site/
├── site/                     ★ the landing page (static, no build step)
│   ├── index.html            hero / HOW TO / FEATURES / growth / download
│   ├── robots.txt
│   ├── sprites/              character sprites used by the page (cp-*.png)
│   └── shots/                app screenshots used in the HOW TO section
├── scripts/
│   ├── carepong_sprites.py   designer PNGs → site/sprites/cp-*.png
│   └── requirements.txt      Python deps (Pillow)
├── docs/
│   └── superpowers/specs/    landing page design spec
├── .github/PULL_REQUEST_TEMPLATE.md
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

- **Editing the landing page**: a text editor and a browser, nothing else
- **Running the sprite script** (only when character art changes)

  | Tool | Version | Used for |
  |------|---------|----------|
  | Python | 3.10+ (tested on 3.13) | `scripts/carepong_sprites.py` |
  | Pillow | 10+ | image processing |

- Developed on macOS and Windows 11

### Getting started

```bash
git clone https://github.com/asiae-girls-2026/carepong-site.git
cd carepong-site
```

- **View the landing page**
  - macOS: `open site/index.html`
  - Windows: `start site\index.html`
- **Regenerate sprites from designer originals** (optional)
  ```bash
  pip install -r scripts/requirements.txt
  python scripts/carepong_sprites.py <design-dir> [out-dir]   # default out: site/sprites/
  ```
  - `<design-dir>` must contain `고양이1.png` … `고양이5.png` and `용가리.png`
  - The script removes the beige grid background, trims transparent edges, downsizes the dragon and draws the mystery box

### Contributing

- Branch → pull request → one approving review → merge (no direct pushes to `main`)
- Use the PR template; attach a screenshot for `site/` changes
- New images go under `site/sprites/` or `site/shots/`
- Never commit `.env*` or `.vercel/`

### License

- Code: [MIT](LICENSE)
- Image assets (sprites, logo, screenshots): © 2026 CarePong team, all rights reserved. Not covered by MIT.
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
  - 캐릭터 스프라이트를 만드는 보조 스크립트 (`scripts/`)
  - 초기 설계 문서 (`docs/`)
- **앱 본체**는 별도 `desktop-pet` 레포 (Electron)

### 레포 구조

```
carepong-site/
├── site/                     ★ 랜딩 페이지 (정적, 빌드 없음)
│   ├── index.html            히어로 / HOW TO / FEATURES / 성장 / 다운로드
│   ├── robots.txt
│   ├── sprites/              페이지에서 쓰는 캐릭터 스프라이트 (cp-*.png)
│   └── shots/                HOW TO 섹션용 앱 캡처
├── scripts/
│   ├── carepong_sprites.py   디자이너 PNG → site/sprites/cp-*.png
│   └── requirements.txt      Python 의존성 (Pillow)
├── docs/
│   └── superpowers/specs/    랜딩 페이지 설계 문서
├── .github/PULL_REQUEST_TEMPLATE.md
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

- **랜딩 페이지 수정**: 텍스트 에디터와 브라우저만 있으면 됨
- **스프라이트 스크립트 실행** (캐릭터 그림이 바뀔 때만)

  | 도구 | 버전 | 용도 |
  |------|------|------|
  | Python | 3.10 이상 (3.13에서 확인) | `scripts/carepong_sprites.py` |
  | Pillow | 10 이상 | 이미지 처리 |

- macOS와 Windows 11에서 개발

### 시작하기

```bash
git clone https://github.com/asiae-girls-2026/carepong-site.git
cd carepong-site
```

- **랜딩 페이지 보기**
  - macOS: `open site/index.html`
  - Windows: `start site\index.html`
- **디자이너 원본으로 스프라이트 다시 만들기** (선택)
  ```bash
  pip install -r scripts/requirements.txt
  python scripts/carepong_sprites.py <디자인폴더> [출력폴더]   # 출력 기본값: site/sprites/
  ```
  - `<디자인폴더>`에는 `고양이1.png` … `고양이5.png`, `용가리.png`가 있어야 함
  - 베이지 격자 배경 제거, 투명 여백 트림, 용 축소, 미스터리 박스 작도를 수행

### 협업 규칙

- 브랜치 → PR → 리뷰 1인 승인 → 머지 (`main` 직접 푸시 금지)
- PR 템플릿 사용, `site/` 변경 시 스크린샷 첨부
- 새 이미지는 `site/sprites/` 또는 `site/shots/`에
- `.env*`, `.vercel/`은 커밋하지 않음

### 라이선스

- 코드: [MIT](LICENSE)
- 이미지 에셋(스프라이트·로고·캡처): © 2026 케어퐁 팀, All rights reserved. MIT 미포함.
- 폰트: 각 CDN에서 SIL Open Font License로 로드
