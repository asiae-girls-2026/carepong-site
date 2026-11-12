const { PNG } = require('pngjs')
const fs = require('fs')
const SRC = process.argv[2]; if (!SRC) { console.error('usage: node scripts/trace64.cjs <source.png>'); process.exit(1) }
const png = PNG.sync.read(fs.readFileSync(SRC))
const SW = png.width, SH = png.height, N = 64
// area downscale to NxN
const cells = Array.from({ length: N }, () => Array(N).fill(null))
for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
  let r=0,g=0,b=0,c=0
  const x0=Math.floor(tx*SW/N), x1=Math.floor((tx+1)*SW/N), y0=Math.floor(ty*SH/N), y1=Math.floor((ty+1)*SH/N)
  for (let y=y0;y<y1;y++) for (let x=x0;x<x1;x++){ const i=(y*SW+x)*4; r+=png.data[i];g+=png.data[i+1];b+=png.data[i+2];c++ }
  cells[ty][tx]={r:r/c,g:g/c,b:b/c}
}
// alpha grid: start all opaque
const A = Array.from({length:N},()=>Array(N).fill(1))
const isWhite=(p)=>{ const mx=Math.max(p.r,p.g,p.b),mn=Math.min(p.r,p.g,p.b); return p.r>236&&p.g>236&&p.b>236&&(mx-mn)<16 }
// flood fill bg from borders
const q=[]; const seen=Array.from({length:N},()=>Array(N).fill(false))
for(let i=0;i<N;i++){ for(const [x,y] of [[i,0],[i,N-1],[0,i],[N-1,i]]) if(!seen[y][x]&&isWhite(cells[y][x])){seen[y][x]=true;A[y][x]=0;q.push([x,y])} }
while(q.length){ const [x,y]=q.pop(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy; if(nx>=0&&nx<N&&ny>=0&&ny<N&&!seen[ny][nx]&&isWhite(cells[ny][nx])){seen[ny][nx]=true;A[ny][nx]=0;q.push([nx,ny])}} }
// keep largest connected opaque component (drop sparkles)
const comp=Array.from({length:N},()=>Array(N).fill(-1)); let best=-1,bestSize=0,id=0
for(let y=0;y<N;y++)for(let x=0;x<N;x++){ if(A[y][x]&&comp[y][x]<0){ const st=[[x,y]]; comp[y][x]=id; let sz=0; const px=[]
  while(st.length){const [cx,cy]=st.pop();sz++;px.push([cx,cy]); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy; if(nx>=0&&nx<N&&ny>=0&&ny<N&&A[ny][nx]&&comp[ny][nx]<0){comp[ny][nx]=id;st.push([nx,ny])}}}
  if(sz>bestSize){bestSize=sz;best=id} id++ } }
for(let y=0;y<N;y++)for(let x=0;x<N;x++){ if(A[y][x]&&comp[y][x]!==best) A[y][x]=0 }
// quantize opaque colors (kmeans)
const pts=[]; for(let y=0;y<N;y++)for(let x=0;x<N;x++) if(A[y][x]) pts.push(cells[y][x])
pts.sort((a,b)=>(a.r+a.g+a.b)-(b.r+b.g+b.b)); const K=18; let cen=[]; for(let i=0;i<K;i++)cen.push({...pts[Math.floor(i/(K-1)*(pts.length-1))]})
for(let it=0;it<12;it++){ const acc=cen.map(()=>({r:0,g:0,b:0,n:0})); for(const p of pts){let bi=0,bd=1e9;for(let c=0;c<K;c++){const dr=p.r-cen[c].r,dg=p.g-cen[c].g,db=p.b-cen[c].b,d=dr*dr+dg*dg+db*db;if(d<bd){bd=d;bi=c}}const a=acc[bi];a.r+=p.r;a.g+=p.g;a.b+=p.b;a.n++} for(let c=0;c<K;c++)if(acc[c].n)cen[c]={r:acc[c].r/acc[c].n,g:acc[c].g/acc[c].n,b:acc[c].b/acc[c].n} }
function nearest(p){let bi=0,bd=1e9;for(let c=0;c<K;c++){const dr=p.r-cen[c].r,dg=p.g-cen[c].g,db=p.b-cen[c].b,d=dr*dr+dg*dg+db*db;if(d<bd){bd=d;bi=c}}return cen[bi]}
// write 64x64
const out=new PNG({width:N,height:N})
for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const i=(y*N+x)*4; if(!A[y][x]){out.data[i+3]=0;continue} const c=nearest(cells[y][x]); out.data[i]=Math.round(c.r);out.data[i+1]=Math.round(c.g);out.data[i+2]=Math.round(c.b);out.data[i+3]=255 }
fs.mkdirSync('preview/dot',{recursive:true}); fs.writeFileSync('preview/dot/axo64.png', PNG.sync.write(out))
// scaled view on light bg
const SC=6, V=new PNG({width:N*SC,height:N*SC}); for(let i=0;i<V.data.length;i+=4){V.data[i]=238;V.data[i+1]=236;V.data[i+2]=243;V.data[i+3]=255}
for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const i=(y*N+x)*4; if(!out.data[i+3])continue; for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((y*SC+yy)*V.width+(x*SC+xx))*4;V.data[di]=out.data[i];V.data[di+1]=out.data[i+1];V.data[di+2]=out.data[i+2];V.data[di+3]=255}}
fs.writeFileSync('preview/dot/axo64-view.png', PNG.sync.write(V))
console.log('traced 64x64, palette',K,'opaque cells',bestSize)
