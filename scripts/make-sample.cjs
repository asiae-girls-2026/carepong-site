const { PNG } = require('pngjs')
const fs = require('fs')
const png = PNG.sync.read(fs.readFileSync('preview/dot/axo-hd.png'))
const N = png.width
const at=(x,y)=>{const i=(y*N+x)*4;return{r:png.data[i],g:png.data[i+1],b:png.data[i+2],a:png.data[i+3]}}
const lum=p=>0.3*p.r+0.59*p.g+0.11*p.b
const dark=Array.from({length:N},()=>Array(N).fill(false))
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const p=at(x,y);if(p.a>0&&lum(p)<92)dark[y][x]=true}
// connected components of dark
const seen=Array.from({length:N},()=>Array(N).fill(false)); const comps=[]
for(let y=0;y<N;y++)for(let x=0;x<N;x++){ if(dark[y][x]&&!seen[y][x]){const st=[[x,y]];seen[y][x]=true;const px=[]
  while(st.length){const [cx,cy]=st.pop();px.push([cx,cy]);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx>=0&&nx<N&&ny>=0&&ny<N&&dark[ny][nx]&&!seen[ny][nx]){seen[ny][nx]=true;st.push([nx,ny])}}}
  const xs=px.map(p=>p[0]),ys=px.map(p=>p[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys)
  const w=x1-x0+1,h=y1-y0+1,fill=px.length/(w*h)
  comps.push({px,size:px.length,w,h,x0,x1,y0,y1,cx:(x0+x1)/2,cy:(y0+y1)/2,fill}) } }
// eyes: filled compact blobs in upper-mid face, not the thin outline ring
const eyeCand=comps.filter(c=>c.w>=5&&c.w<=22&&c.h>=5&&c.h<=24&&c.fill>0.45&&c.cy>N*0.28&&c.cy<N*0.62)
  .sort((a,b)=>b.size-a.size).slice(0,4)
console.log('eye candidates:')
eyeCand.forEach(c=>console.log(`  (${Math.round(c.cx)},${Math.round(c.cy)}) ${c.w}x${c.h} fill${c.fill.toFixed(2)} sz${c.size}`))
// pick the 2 most similar-sized, symmetric pair
let eyes=null,bestScore=1e9
for(let i=0;i<eyeCand.length;i++)for(let j=i+1;j<eyeCand.length;j++){const a=eyeCand[i],b=eyeCand[j]
  const dy=Math.abs(a.cy-b.cy), dsz=Math.abs(a.size-b.size)/Math.max(a.size,b.size), dx=Math.abs(a.cx-b.cx)
  const score=dy*3+dsz*40 - dx*0.2  // similar y, similar size, far apart in x
  if(dx>12&&dy<10&&score<bestScore){bestScore=score;eyes=[a,b]}}
if(!eyes)eyes=eyeCand.slice(0,2)
console.log('chosen eyes:', eyes.map(e=>`(${Math.round(e.cx)},${Math.round(e.cy)})`).join(' '))
// body color sampler (above the eye)
function bodyAbove(c){ for(let dy=2;dy<10;dy++){const y=c.y0-dy,x=Math.round(c.cx);if(y>=0){const p=at(x,y);if(p.a>0&&lum(p)>140)return p}} return {r:255,g:225,b:238} }
const blink=new PNG({width:N,height:N}); png.data.copy(blink.data)
eyes.forEach(c=>{ const col=bodyAbove(c)
  for(const [x,y] of c.px){const i=(y*N+x)*4;blink.data[i]=col.r;blink.data[i+1]=col.g;blink.data[i+2]=col.b;blink.data[i+3]=255}
  const midY=Math.round(c.cy)
  for(let yy=midY;yy<=midY+1;yy++)for(let x=c.x0;x<=c.x1;x++){const i=(yy*N+x)*4;blink.data[i]=67;blink.data[i+1]=52;blink.data[i+2]=79;blink.data[i+3]=255}
})
fs.writeFileSync('preview/dot/axo-hd_blink.png', PNG.sync.write(blink))
// view both states side by side at 3x on bg
function blitView(){ const SC=3,GAP=16,VW=N*SC*2+GAP*3,VH=N*SC+GAP*2
  const V=new PNG({width:VW,height:VH}); for(let i=0;i<V.data.length;i+=4){V.data[i]=238;V.data[i+1]=236;V.data[i+2]=243;V.data[i+3]=255}
  function put(src,ox){for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=(y*N+x)*4;if(!src.data[i+3])continue;for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((GAP+y*SC+yy)*VW+(ox+x*SC+xx))*4;V.data[di]=src.data[i];V.data[di+1]=src.data[i+1];V.data[di+2]=src.data[i+2];V.data[di+3]=255}}}
  put(png,GAP);put(blink,GAP*2+N*SC);fs.writeFileSync('preview/dot/blink-check.png',PNG.sync.write(V)) }
blitView()
console.log('blink frame + check written')
