const { PNG } = require('pngjs')
const fs=require('fs')
const SRC=process.argv[2],OUT=process.argv[3]
const png=PNG.sync.read(fs.readFileSync(SRC));const N=png.width
const at=(x,y)=>{const i=(y*N+x)*4;return{r:png.data[i],g:png.data[i+1],b:png.data[i+2],a:png.data[i+3]}}
const lum=p=>0.3*p.r+0.59*p.g+0.11*p.b
const dark=Array.from({length:N},()=>Array(N).fill(false))
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const p=at(x,y);if(p.a>0&&lum(p)<92)dark[y][x]=true}
const seen=Array.from({length:N},()=>Array(N).fill(false));const comps=[]
for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(dark[y][x]&&!seen[y][x]){const st=[[x,y]];seen[y][x]=true;const px=[]
  while(st.length){const[cx,cy]=st.pop();px.push([cx,cy]);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx>=0&&nx<N&&ny>=0&&ny<N&&dark[ny][nx]&&!seen[ny][nx]){seen[ny][nx]=true;st.push([nx,ny])}}}
  const xs=px.map(p=>p[0]),ys=px.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),w=x1-x0+1,h=y1-y0+1
  comps.push({px,size:px.length,w,h,x0,x1,y0,y1,cx:(x0+x1)/2,cy:(y0+y1)/2,fill:px.length/(w*h)})}}
const cand=comps.filter(c=>c.w>=5&&c.w<=24&&c.h>=5&&c.h<=26&&c.fill>0.45&&c.cy>N*0.25&&c.cy<N*0.62).sort((a,b)=>b.size-a.size).slice(0,4)
let eyes=null,bs=1e9
for(let i=0;i<cand.length;i++)for(let j=i+1;j<cand.length;j++){const a=cand[i],b=cand[j],dy=Math.abs(a.cy-b.cy),dsz=Math.abs(a.size-b.size)/Math.max(a.size,b.size),dx=Math.abs(a.cx-b.cx);const sc=dy*3+dsz*40-dx*0.2;if(dx>12&&dy<10&&sc<bs){bs=sc;eyes=[a,b]}}
if(!eyes)eyes=cand.slice(0,2)
console.log('eyes:',eyes.map(e=>`(${Math.round(e.cx)},${Math.round(e.cy)})`).join(' '))
function bodyAbove(c){for(let dy=2;dy<12;dy++){const y=c.y0-dy,x=Math.round(c.cx);if(y>=0){const p=at(x,y);if(p.a>0&&lum(p)>140)return p}}return{r:255,g:225,b:238}}
const blink=new PNG({width:N,height:N});png.data.copy(blink.data)
eyes.forEach(c=>{const col=bodyAbove(c);for(const[x,y]of c.px){const i=(y*N+x)*4;blink.data[i]=col.r;blink.data[i+1]=col.g;blink.data[i+2]=col.b;blink.data[i+3]=255}
  const midY=Math.round(c.cy);for(let yy=midY;yy<=midY+1;yy++)for(let x=c.x0;x<=c.x1;x++){const i=(yy*N+x)*4;blink.data[i]=67;blink.data[i+1]=52;blink.data[i+2]=79;blink.data[i+3]=255}})
fs.writeFileSync(OUT,PNG.sync.write(blink));console.log('blink ->',OUT)
