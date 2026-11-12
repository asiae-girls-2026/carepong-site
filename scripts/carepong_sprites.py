# 케어퐁 랜딩 스프라이트 전처리
# 1) 고양이 1~5: 베이지 격자 배경 플러드필 제거 + 'Lv.N' 라벨/잔여 조각 제거 + 알파 트림
# 2) 용가리: 알파 트림 + 다운스케일
# 3) 미스터리 박스: 24×24 픽셀 작도 → ×12 nearest
#
# 사용법: python scripts/carepong_sprites.py <디자인 원본 폴더> [출력 폴더]
#   - 디자인 원본 폴더: 고양이1.png ~ 고양이5.png, 용가리.png 가 있는 폴더
#   - 출력 폴더 생략 시 레포의 site/sprites/ 에 저장
import os
import sys
from collections import deque
from PIL import Image

if len(sys.argv) < 2:
    sys.exit('usage: python scripts/carepong_sprites.py <design-dir> [out-dir]')
SRC = os.path.join(sys.argv[1], '')
OUT = os.path.join(
    sys.argv[2] if len(sys.argv) > 2
    else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site', 'sprites'),
    '')
os.makedirs(OUT, exist_ok=True)


def flood_bg(im, tol=26):
    """가장자리에서 배경색(밝은 베이지·격자선) 플러드필 → 투명 처리"""
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    q = deque()

    def is_bg(p):
        r, g, b, a = p
        if a < 10:
            return True
        # 밝은 베이지 계열 (격자선 포함 — 약간 어두워도 저채도·밝음)
        mx, mn = max(r, g, b), min(r, g, b)
        return mx > 205 and (mx - mn) < 36

    for x in range(w):
        for y in (0, h - 1):
            if not seen[y][x] and is_bg(px[x, y]):
                seen[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not seen[y][x] and is_bg(px[x, y]):
                seen[y][x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and is_bg(px[nx, ny]):
                seen[ny][nx] = True
                q.append((nx, ny))
    return im


def components(im):
    w, h = im.size
    px = im.load()
    lab = [[0] * w for _ in range(h)]
    comps = []
    nid = 0
    for sy in range(h):
        for sx in range(w):
            if px[sx, sy][3] > 10 and lab[sy][sx] == 0:
                nid += 1
                q = deque([(sx, sy)])
                lab[sy][sx] = nid
                pts = []
                while q:
                    x, y = q.popleft()
                    pts.append((x, y))
                    for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1),(x+1,y+1),(x-1,y-1),(x+1,y-1),(x-1,y+1)):
                        if 0 <= nx < w and 0 <= ny < h and lab[ny][nx] == 0 and px[nx, ny][3] > 10:
                            lab[ny][nx] = nid
                            q.append((nx, ny))
                xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
                comps.append({'pts': pts, 'bbox': (min(xs), min(ys), max(xs), max(ys)), 'area': len(pts)})
    return comps


def clean_cat(name, out):
    im = flood_bg(Image.open(SRC + name))
    w, h = im.size
    px = im.load()
    comps = sorted(components(im), key=lambda c: -c['area'])
    main = comps[0]
    mx0, my0, mx1, my1 = main['bbox']
    for c in comps[1:]:
        x0, y0, x1, y1 = c['bbox']
        cx = (x0 + x1) / 2
        ch = y1 - y0 + 1
        # 'Lv.N' 라벨: 하단 중앙의 납작한 조각
        is_label = y0 > h * 0.75 and ch < h * 0.16 and w * 0.2 < cx < w * 0.8 and c['area'] < w * h * 0.05
        # 본체 바깥의 작은 장식 잔재(배경지 반짝이 등)
        far = x1 < mx0 - 6 or x0 > mx1 + 6 or y1 < my0 - 6 or y0 > my1 + 6
        is_stray = c['area'] < 140 and far
        if is_label or is_stray:
            for x, y in c['pts']:
                px[x, y] = (0, 0, 0, 0)
    bbox = im.getchannel('A').getbbox()
    im = im.crop(bbox)
    im.save(OUT + out)
    print(out, im.size)


for i in range(1, 6):
    clean_cat(f'고양이{i}.png', f'cp-cat-{i}.png')

# 용가리 — 트림 + 1/3.5 다운스케일 (픽셀 블록 유지)
d = Image.open(SRC + '용가리.png').convert('RGBA')
d = d.crop(d.getchannel('A').getbbox())
d = d.resize((d.width // 3, d.height // 3), Image.NEAREST)
d.save(OUT + 'cp-dragon.png')
print('cp-dragon.png', d.size)

# 미스터리 박스 — 24×24 직접 작도
PAL = {'K': (43, 36, 64, 255), 'L': (185, 174, 232, 255), 'D': (143, 130, 201, 255),
       'S': (214, 207, 245, 255), 'W': (255, 247, 225, 255), 'Y': (255, 210, 74, 255)}
G = [
    "........................",
    "..................Y.....",
    ".................YYY....",
    "..................Y.....",
    "....KKKKKKKKKKKKKK......",
    "...KSSSSSSSSSSSSSSK.....",
    "..KSLLLLLLLLLLLLLLSK....",
    "..KLLLLLKKKKKKLLLLLK....",
    "..KLLLLKKWWWWKKLLLLK....",
    "..KLLLLKWWKKWWKLLLLK....",
    "..KDDDDKWKKKWWKDDDDK....",
    "..KLLLLLKKKWWKKLLLLK....",
    "..KLLLLLLKWWKKLLLLLK....",
    "..KLLLLLLKWWKLLLLLLK....",
    "..KLLLLLLKKKKLLLLLLK....",
    "..KDDDDDLKWWKLDDDDDK....",
    "..KLLLLLLKKKKLLLLLLK....",
    "..KLLLLLLLLLLLLLLLLK....",
    "..KSLLLLLLLLLLLLLLSK....",
    "...KKKKKKKKKKKKKKKK.....",
    "........................",
    "........................",
    "........................",
    "........................",
]
box = Image.new('RGBA', (24, 24), (0, 0, 0, 0))
bp = box.load()
for y, row in enumerate(G):
    for x, ch in enumerate(row):
        if ch in PAL:
            bp[x, y] = PAL[ch]
box = box.crop(box.getchannel('A').getbbox())
box = box.resize((box.width * 12, box.height * 12), Image.NEAREST)
box.save(OUT + 'cp-mystery.png')
print('cp-mystery.png', box.size)
