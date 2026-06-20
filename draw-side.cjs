const { save } = require('./render-lib.cjs')
const W=66,H=52
const PAL={'.':null,'K':'#43344f','B':'#ffd0e4','b':'#f3a8cb','d':'#e98ab4','W':'#fff5fb','G':'#ff8ec2','g':'#ef6fab',
  'E':'#43344f','H':'#ffffff','P':'#ff7fae','M':'#d96a96','Y':'#ffd44f','y':'#f0b830'}
function build(phase){
  const g=Array.from({length:H},()=>Array(W).fill('.'))
  const inb=(x,y)=>x>=0&&x<W&&y>=0&&y<H
  const sp=(x,y,c)=>{if(inb(x,y))g[y][x]=c}
  const ell=(cx,cy,rx,ry,c)=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x-cx)/rx,dy=(y-cy)/ry;if(dx*dx+dy*dy<=1)g[y][x]=c}}
  const frill=(x,y,c)=>{ell(x,y,2,3,c);sp(x,y-3,'g');sp(x,y+3,'g');sp(x+1,y,'g')}
  function limb(hx,hy,fx,fy,col){const steps=Math.max(Math.abs(fx-hx),Math.abs(fy-hy),1)
    for(let s=0;s<=steps;s++){const x=Math.round(hx+(fx-hx)*s/steps),y=Math.round(hy+(fy-hy)*s/steps);for(let w=-1;w<=1;w++)sp(x+w,y,col)}
    for(let w=-1;w<=2;w++)sp(fx+w,fy,col)}
  function outline(){const cp=g.map(r=>r.slice());const nb=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(cp[y][x]!=='.')continue
      if(nb.some(([dx,dy])=>inb(x+dx,y+dy)&&cp[y+dy][x+dx]!=='.'&&cp[y+dy][x+dx]!=='K'))g[y][x]='K'}}
  // leg foot targets per phase (trot)
  const P=phase===0
    ?{nf:[20,41],nb:[44,38],ff:[28,40],fb:[48,41]}
    :{nf:[24,38],nb:[40,41],ff:[30,41],fb:[46,38]}
  // FAR legs (behind, darker)
  limb(28,31,P.ff[0],P.ff[1],'d'); limb(46,31,P.fb[0],P.fb[1],'d')
  // gills + star (behind head top)
  frill(22,9,'G'); frill(25,13,'G'); frill(24,18,'G')
  // tail (right, up-curl taper)
  for(let i=0;i<=16;i++){const x=44+i;const t=i/16;const cy=24-Math.round(t*5);const hh=Math.max(1,Math.round(8*(1-t)+1));for(let y=cy-hh;y<=cy+hh;y++)sp(x,y,'B')}
  // body
  ell(32,24,15,9,'B')
  // head
  ell(16,21,11,10,'B')
  // belly white
  ell(30,30,11,3,'W'); ell(14,26,6,4,'W')
  // body bottom shadow
  for(let x=20;x<=44;x++)sp(x,32,'b')
  // NEAR legs (front, body color)
  limb(22,31,P.nf[0],P.nf[1],'B'); limb(40,31,P.nb[0],P.nb[1],'B')
  // re-cap body/head over limb tops
  ell(32,24,15,9,'B'); ell(16,21,11,10,'B'); ell(30,30,11,3,'W'); ell(14,26,6,4,'W')
  // star on head
  sp(16,8,'Y');sp(15,9,'Y');sp(16,9,'Y');sp(17,9,'Y');sp(16,10,'Y');sp(14,9,'y');sp(18,9,'y');sp(16,7,'y')
  outline()
  // face (facing left)
  ;[[10,20],[18,20]].forEach(([ex,ey])=>{ell(ex,ey,2,2.7,'E');sp(ex-1,ey-1,'H');sp(ex,ey-1,'H')})
  ell(7,24,2,1.4,'P'); ell(21,24,2,1.4,'P')
  sp(12,25,'M');sp(13,26,'M');sp(14,25,'M');sp(15,26,'M');sp(16,25,'M')
  sp(12,23,'K');sp(16,23,'K')
  return g
}
save(build(0),PAL,1,'preview/hand/side_0.png')
save(build(1),PAL,1,'preview/hand/side_1.png')
// 2-up view
const { PNG } = require('/Users/chaewon/desktop-pet/node_modules/pngjs');const fs=require('fs')
const a=PNG.sync.read(fs.readFileSync('preview/hand/side_0.png')),b=PNG.sync.read(fs.readFileSync('preview/hand/side_1.png'))
const SC=6,GAP=16,VW=W*SC*2+GAP*3,VH=H*SC+GAP*2,V=new PNG({width:VW,height:VH})
for(let i=0;i<V.data.length;i+=4){V.data[i]=238;V.data[i+1]=236;V.data[i+2]=243;V.data[i+3]=255}
function put(src,ox){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(!src.data[i+3])continue;for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((GAP+y*SC+yy)*VW+(ox+x*SC+xx))*4;V.data[di]=src.data[i];V.data[di+1]=src.data[i+1];V.data[di+2]=src.data[i+2];V.data[di+3]=255}}}
put(a,GAP);put(b,GAP*2+W*SC);fs.writeFileSync('preview/hand/side-check.png',PNG.sync.write(V))
console.log('side pose 2 frames drawn')
