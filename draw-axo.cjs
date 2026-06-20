const { save } = require('./render-lib.cjs')
const W=54,H=42
const PAL={ '.':null,'K':'#43344f','B':'#ffd6e8','b':'#f4b3d2','W':'#fff5fb','G':'#ff96c6','g':'#ef6fab',
  'E':'#43344f','H':'#ffffff','P':'#ff7fae','M':'#d96a96','Y':'#ffd86b' }
function build({legPhase=0, blink=false}={}){
  const g=Array.from({length:H},()=>Array(W).fill('.'))
  const inb=(x,y)=>x>=0&&x<W&&y>=0&&y<H
  const sp=(x,y,c)=>{ if(inb(x,y)) g[y][x]=c }
  function ell(cx,cy,rx,ry,c){ for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x-cx)/rx,dy=(y-cy)/ry; if(dx*dx+dy*dy<=1) g[y][x]=c} }
  function frill(x,y){ ell(x,y,2,3,'G'); sp(x,y-3,'g'); sp(x,y+3,'g'); sp(x-1,y,'g') }
  function outline(){ const cp=g.map(r=>r.slice()); const nb=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(cp[y][x]!=='.')continue
      if(nb.some(([dx,dy])=>inb(x+dx,y+dy)&&cp[y+dy][x+dx]!=='.'&&cp[y+dy][x+dx]!=='K')) g[y][x]='K' } }
  frill(28,10); frill(33,14); frill(32,20)
  for(let i=0;i<=14;i++){ const x=33+i; const t=i/14; const cy=22-Math.round(t*4); const hh=Math.max(1,Math.round(7*(1-t)+1)); for(let y=cy-hh;y<=cy+hh;y++) sp(x,y,'B') }
  ell(24,24,12,8,'B')
  ell(14,19,11,10,'B')
  ell(19,28,8,4,'W'); ell(12,23,6,5,'W')
  for(let x=13;x<=33;x++) sp(x,31,'b')
  const legs=[[9,29,'f'],[18,31,'f'],[26,31,'b'],[32,30,'b']]
  legs.forEach(([lx,ly,grp])=>{ const lift=(legPhase===0?(grp==='f'?0:1):(grp==='f'?1:0)); const top=ly+lift, len=5-lift
    for(let y=top;y<top+len;y++){ sp(lx,y,'B'); sp(lx+1,y,'B'); sp(lx+2,y,'B') } sp(lx,top+len,'b'); sp(lx+1,top+len,'b'); sp(lx+2,top+len,'b') })
  ell(24,24,12,8,'B'); ell(14,19,11,10,'B'); ell(19,28,8,4,'W'); ell(12,23,6,5,'W')
  outline()
  ell(6,23,2,1.4,'P'); ell(20,23,2,1.4,'P')
  sp(12,24,'M'); sp(13,25,'M'); sp(14,24,'M'); sp(15,25,'M'); sp(16,24,'M')
  sp(12,22,'K'); sp(16,22,'K')
  if(blink){ for(const ex of [9,17]){ sp(ex-1,20,'E');sp(ex,20,'E');sp(ex+1,20,'E') } }
  else { for(const ex of [9,17]){ ell(ex,19,2,2.6,'E'); sp(ex-1,18,'H'); sp(ex,18,'H'); sp(ex-1,19,'H') } }
  return g
}
save(build({legPhase:0}), PAL, 1, 'preview/hand/axo_0.png')
save(build({legPhase:1}), PAL, 1, 'preview/hand/axo_1.png')
save(build({blink:true}), PAL, 1, 'preview/hand/axo_blink.png')
save(build({legPhase:0}), PAL, 8, 'preview/hand/axo-view.png', '#eeecf3')
console.log('done v3')
