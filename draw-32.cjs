const { save } = require('./render-lib.cjs')
const { PNG } = require('/Users/chaewon/desktop-pet/node_modules/pngjs'); const fs=require('fs')
const W=32,H=32
// 11-color palette
const PAL={'.':null,'K':'#3a2e4d','B':'#ffc6e0','b':'#f29ec8','d':'#e07ba8','W':'#fff3fa',
  'G':'#ff85bf','E':'#3a2e4d','H':'#ffffff','P':'#ff6fa3','M':'#cf5e88','Y':'#ffd84f'}
function build(phase=0,blink=false){
  const g=Array.from({length:H},()=>Array(W).fill('.'))
  const inb=(x,y)=>x>=0&&x<W&&y>=0&&y<H, sp=(x,y,c)=>{if(inb(x,y))g[y][x]=c}
  const ell=(cx,cy,rx,ry,c)=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x-cx)/rx,dy=(y-cy)/ry;if(dx*dx+dy*dy<=1)g[y][x]=c}}
  const limb=(hx,hy,fx,fy,c)=>{const st=Math.max(Math.abs(fx-hx),Math.abs(fy-hy),1);for(let s=0;s<=st;s++){const x=Math.round(hx+(fx-hx)*s/st),y=Math.round(hy+(fy-hy)*s/st);sp(x,y,c);sp(x+1,y,c)}sp(fx,fy,c);sp(fx+1,fy,c)}
  const outline=()=>{const cp=g.map(r=>r.slice());const nb=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(cp[y][x]!=='.')continue;if(nb.some(([dx,dy])=>inb(x+dx,y+dy)&&cp[y+dy][x+dx]!=='.'&&cp[y+dy][x+dx]!=='K'))g[y][x]='K'}}
  // leg foot targets per phase
  const P=phase===0?{nf:[7,26],nb:[18,24],ff:[11,25],fb:[21,26]}:{nf:[9,24],nb:[16,26],ff:[13,26],fb:[19,24]}
  // far legs (darker, behind)
  limb(12,21,P.ff[0],P.ff[1],'d'); limb(20,21,P.fb[0],P.fb[1],'d')
  // gills (3 small frills, back-top of head)
  ;[[14,7],[16,10],[15,13]].forEach(([x,y])=>{ell(x,y,1.6,2,'G');sp(x+1,y-2,'G');sp(x+1,y+2,'G')})
  // tail
  for(let i=0;i<=7;i++){const x=24+i,cy=16-Math.round(i/7*4),hh=Math.max(1,Math.round(5*(1-i/7)));for(let y=cy-hh;y<=cy+hh;y++)sp(x,y,'B')}
  // body + head
  ell(18,16,8,5,'B'); ell(10,13,6,6,'B')
  // belly
  ell(15,19,7,2,'W'); ell(8,16,4,3,'W')
  // shadow
  for(let x=10;x<=23;x++)sp(x,20,'b')
  // near legs (front, body color)
  limb(8,21,P.nf[0],P.nf[1],'B'); limb(17,21,P.nb[0],P.nb[1],'B')
  // recap body/head over leg tops
  ell(18,16,8,5,'B'); ell(10,13,6,6,'B'); ell(15,19,7,2,'W'); ell(8,16,4,3,'W')
  // star
  sp(10,4,'Y');sp(9,5,'Y');sp(10,5,'Y');sp(11,5,'Y');sp(10,6,'Y')
  outline()
  // face
  if(blink){sp(6,13,'E');sp(7,13,'E');sp(10,13,'E');sp(11,13,'E')}
  else{[[6,12],[10,12]].forEach(([x,y])=>{sp(x,y,'E');sp(x+1,y,'E');sp(x,y+1,'E');sp(x+1,y+1,'E');sp(x,y,'H')})}
  ell(4,15,1.4,1,'P'); ell(13,15,1.4,1,'P')
  sp(7,15,'M');sp(8,16,'M');sp(9,15,'M')
  return g
}
function nearest4(srcPath,dstPath){const p=PNG.sync.read(fs.readFileSync(srcPath));const S=4;const o=new PNG({width:p.width*S,height:p.height*S})
  for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){const i=(y*p.width+x)*4;for(let yy=0;yy<S;yy++)for(let xx=0;xx<S;xx++){const di=((y*S+yy)*o.width+(x*S+xx))*4;o.data[di]=p.data[i];o.data[di+1]=p.data[i+1];o.data[di+2]=p.data[i+2];o.data[di+3]=p.data[i+3]}}
  fs.writeFileSync(dstPath,PNG.sync.write(o))}
fs.mkdirSync('preview/px32',{recursive:true})
save(build(0),PAL,1,'preview/px32/axo_0.png')          // native 32
save(build(1),PAL,1,'preview/px32/axo_1.png')
save(build(0,true),PAL,1,'preview/px32/axo_blink.png')
nearest4('preview/px32/axo_0.png','preview/px32/axo_0@4x.png')  // 128 nearest
save(build(0),PAL,8,'preview/px32/axo-view.png','#eeecf3')      // 256 view for me (8x)
// 2-frame walk check at 8x
const a=PNG.sync.read(fs.readFileSync('preview/px32/axo_0.png')),b=PNG.sync.read(fs.readFileSync('preview/px32/axo_1.png'))
const SC=8,GAP=16,VW=W*SC*2+GAP*3,VH=H*SC+GAP*2,V=new PNG({width:VW,height:VH})
for(let i=0;i<V.data.length;i+=4){V.data[i]=238;V.data[i+1]=236;V.data[i+2]=243;V.data[i+3]=255}
function put(src,ox){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(!src.data[i+3])continue;for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((GAP+y*SC+yy)*VW+(ox+x*SC+xx))*4;V.data[di]=src.data[i];V.data[di+1]=src.data[i+1];V.data[di+2]=src.data[i+2];V.data[di+3]=255}}}
put(a,GAP);put(b,GAP*2+W*SC);fs.writeFileSync('preview/px32/walk-check.png',PNG.sync.write(V))
console.log('32px axolotl drawn (native + nearest4 + walk frames)')
