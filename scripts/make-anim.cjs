const { PNG } = require('/Users/chaewon/desktop-pet/node_modules/pngjs')
const fs = require('fs')
const png = PNG.sync.read(fs.readFileSync('preview/dot/axo64.png'))
const N = png.width
const at=(x,y)=>{const i=(y*N+x)*4;return {r:png.data[i],g:png.data[i+1],b:png.data[i+2],a:png.data[i+3]}}
const lum=(p)=>0.3*p.r+0.59*p.g+0.11*p.b
// find dark blobs (eyes/outline). eyes = dark, roundish, in upper-mid, not touching border much
const dark=Array.from({length:N},()=>Array(N).fill(false))
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const p=at(x,y); if(p.a>0&&lum(p)<95) dark[y][x]=true}
const seen=Array.from({length:N},()=>Array(N).fill(false)); const comps=[]
for(let y=4;y<N*0.62;y++)for(let x=0;x<N;x++){ if(dark[y][x]&&!seen[y][x]){ const st=[[x,y]]; seen[y][x]=true; const px=[]
  while(st.length){const [cx,cy]=st.pop(); px.push([cx,cy]); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy; if(nx>=0&&nx<N&&ny>=0&&ny<N&&dark[ny][nx]&&!seen[ny][nx]){seen[ny][nx]=true;st.push([nx,ny])}}}
  const xs=px.map(p=>p[0]),ys=px.map(p=>p[1]); const w=Math.max(...xs)-Math.min(...xs)+1,h=Math.max(...ys)-Math.min(...ys)+1
  comps.push({px,size:px.length,w,h,cx:(Math.min(...xs)+Math.max(...xs))/2,cy:(Math.min(...ys)+Math.max(...ys))/2,x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)}) } }
// eyes: blob-like (w,h between 2..10, roughly square), pick 2 largest such
const cand=comps.filter(c=>c.w>=2&&c.w<=10&&c.h>=2&&c.h<=12&&c.size>=4).sort((a,b)=>b.size-a.size).slice(0,2)
console.log('eye candidates:', cand.map(c=>`(${Math.round(c.cx)},${Math.round(c.cy)}) ${c.w}x${c.h} sz${c.size}`).join('  '))
// build blink: for each eye blob, replace with body color, then draw dark line at mid
function bodyColorNear(x,y){ // sample a nearby opaque non-dark pixel (prefer above)
  for(const [dx,dy] of [[0,-3],[0,-2],[-3,0],[3,0],[0,3]]){ const nx=x+dx,ny=y+dy; if(nx>=0&&nx<N&&ny>=0&&ny<N){const p=at(nx,ny); if(p.a>0&&lum(p)>=120) return p}} return {r:255,g:230,b:240}
}
const blink=new PNG({width:N,height:N}); png.data.copy(blink.data)
cand.forEach(c=>{ const col=bodyColorNear(Math.round(c.cx),c.y0-1)
  for(const [x,y] of c.px){ const i=(y*N+x)*4; blink.data[i]=col.r;blink.data[i+1]=col.g;blink.data[i+2]=col.b;blink.data[i+3]=255 }
  const midY=Math.round(c.cy)
  for(let x=Math.round(c.x0);x<=Math.round(c.x1);x++){ const i=(midY*N+x)*4; blink.data[i]=67;blink.data[i+1]=52;blink.data[i+2]=79;blink.data[i+3]=255 }
})
fs.writeFileSync('preview/dot/axo64_blink.png', PNG.sync.write(blink))
// scaled views
function view(src,dst){ const p=PNG.sync.read(fs.readFileSync(src)); const SC=6; const V=new PNG({width:N*SC,height:N*SC}); for(let i=0;i<V.data.length;i+=4){V.data[i]=238;V.data[i+1]=236;V.data[i+2]=243;V.data[i+3]=255}
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=(y*N+x)*4; if(!p.data[i+3])continue; for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((y*SC+yy)*V.width+(x*SC+xx))*4;V.data[di]=p.data[i];V.data[di+1]=p.data[i+1];V.data[di+2]=p.data[i+2];V.data[di+3]=255}}
  fs.writeFileSync(dst,PNG.sync.write(V)) }
view('preview/dot/axo64_blink.png','preview/dot/axo64_blink-view.png')
console.log('blink frame made')
