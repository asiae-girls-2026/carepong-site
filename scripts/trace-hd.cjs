const { PNG } = require('pngjs')
const fs = require('fs')
const SRC = process.argv[2]; if (!SRC) { console.error('usage: node scripts/trace-hd.cjs <source.png>'); process.exit(1) }
const png=PNG.sync.read(fs.readFileSync(SRC)); const SW=png.width,SH=png.height
const N=128
const cells=Array.from({length:N},()=>Array(N).fill(null))
for(let ty=0;ty<N;ty++)for(let tx=0;tx<N;tx++){let r=0,g=0,b=0,c=0
  const x0=Math.floor(tx*SW/N),x1=Math.floor((tx+1)*SW/N),y0=Math.floor(ty*SH/N),y1=Math.floor((ty+1)*SH/N)
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*SW+x)*4;r+=png.data[i];g+=png.data[i+1];b+=png.data[i+2];c++}
  cells[ty][tx]={r:r/c,g:g/c,b:b/c}}
const A=Array.from({length:N},()=>Array(N).fill(1))
const white=p=>{const mx=Math.max(p.r,p.g,p.b),mn=Math.min(p.r,p.g,p.b);return p.r>232&&p.g>232&&p.b>232&&(mx-mn)<20}
const seen=Array.from({length:N},()=>Array(N).fill(false)),q=[]
for(let i=0;i<N;i++)for(const [x,y] of [[i,0],[i,N-1],[0,i],[N-1,i]])if(!seen[y][x]&&white(cells[y][x])){seen[y][x]=true;A[y][x]=0;q.push([x,y])}
while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<N&&ny>=0&&ny<N&&!seen[ny][nx]&&white(cells[ny][nx])){seen[ny][nx]=true;A[ny][nx]=0;q.push([nx,ny])}}}
const comp=Array.from({length:N},()=>Array(N).fill(-1));let best=-1,bsz=0,id=0
for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(A[y][x]&&comp[y][x]<0){const st=[[x,y]];comp[y][x]=id;let sz=0;while(st.length){const [cx,cy]=st.pop();sz++;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx>=0&&nx<N&&ny>=0&&ny<N&&A[ny][nx]&&comp[ny][nx]<0){comp[ny][nx]=id;st.push([nx,ny])}}}if(sz>bsz){bsz=sz;best=id}id++}}
for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(A[y][x]&&comp[y][x]!==best)A[y][x]=0
const pts=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(A[y][x])pts.push(cells[y][x])
pts.sort((a,b)=>(a.r+a.g+a.b)-(b.r+b.g+b.b));const K=20;let cen=[];for(let i=0;i<K;i++)cen.push({...pts[Math.floor(i/(K-1)*(pts.length-1))]})
for(let it=0;it<14;it++){const acc=cen.map(()=>({r:0,g:0,b:0,n:0}));for(const p of pts){let bi=0,bd=1e9;for(let c=0;c<K;c++){const dr=p.r-cen[c].r,dg=p.g-cen[c].g,db=p.b-cen[c].b,d=dr*dr+dg*dg+db*db;if(d<bd){bd=d;bi=c}}const a=acc[bi];a.r+=p.r;a.g+=p.g;a.b+=p.b;a.n++}for(let c=0;c<K;c++)if(acc[c].n)cen[c]={r:acc[c].r/acc[c].n,g:acc[c].g/acc[c].n,b:acc[c].b/acc[c].n}}
const near=p=>{let bi=0,bd=1e9;for(let c=0;c<K;c++){const dr=p.r-cen[c].r,dg=p.g-cen[c].g,db=p.b-cen[c].b,d=dr*dr+dg*dg+db*db;if(d<bd){bd=d;bi=c}}return cen[bi]}
const col=Array.from({length:N},()=>Array(N).fill(null))
for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(A[y][x])col[y][x]=near(cells[y][x])
// denoise
const nb4=[[1,0],[-1,0],[0,1],[0,-1]]
for(let p=0;p<2;p++)for(let y=0;y<N;y++)for(let x=0;x<N;x++){let on=0;for(const[dx,dy]of nb4){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<N&&ny>=0&&ny<N&&A[ny][nx])on++}
  if(A[y][x]&&on<=1){A[y][x]=0;col[y][x]=null}else if(!A[y][x]&&on===4){A[y][x]=1;let r=0,g=0,b=0;for(const[dx,dy]of nb4){const c=col[y+dy][x+dx];r+=c.r;g+=c.g;b+=c.b}col[y][x]={r:r/4,g:g/4,b:b/4}}}
// clean outline: darken outermost opaque ring
const dark=cen.reduce((a,c)=>(c.r+c.g+c.b<a.r+a.g+a.b?c:a),cen[0])
const ol={r:Math.max(0,dark.r-10),g:Math.max(0,dark.g-10),b:Math.max(0,dark.b-10)}
const edge=[]
for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!A[y][x])continue;let border=false;for(const[dx,dy]of nb4){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=N||ny>=N||!A[ny][nx])border=true}if(border)edge.push([x,y])}
edge.forEach(([x,y])=>{col[y][x]={...ol}})
// write helpers
function writeScaled(scale,path,bg,smooth){
  const out=new PNG({width:N*scale,height:N*scale})
  if(bg){for(let i=0;i<out.data.length;i+=4){out.data[i]=238;out.data[i+1]=236;out.data[i+2]=243;out.data[i+3]=255}}
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const c=col[y][x];for(let yy=0;yy<scale;yy++)for(let xx=0;xx<scale;xx++){const di=((y*scale+yy)*out.width+(x*scale+xx))*4
    if(!c){if(!bg)out.data[di+3]=0}else{out.data[di]=Math.round(c.r);out.data[di+1]=Math.round(c.g);out.data[di+2]=Math.round(c.b);out.data[di+3]=255}}}
  fs.writeFileSync(path,PNG.sync.write(out))
}
fs.mkdirSync('preview/dot',{recursive:true})
writeScaled(1,'preview/dot/axo-hd.png',false)        // 128 master, transparent
writeScaled(4,'preview/dot/axo-hd-view.png',true)    // 512 view for me
// "in-game small" : downscale 128 -> 44 smoothly to show it stays detailed small
const M=44; const small=new PNG({width:M*5,height:M*5}); for(let i=0;i<small.data.length;i+=4){small.data[i]=238;small.data[i+1]=236;small.data[i+2]=243;small.data[i+3]=255}
for(let ty=0;ty<M;ty++)for(let tx=0;tx<M;tx++){let r=0,g=0,b=0,a=0,c=0
  const x0=Math.floor(tx*N/M),x1=Math.floor((tx+1)*N/M),y0=Math.floor(ty*N/M),y1=Math.floor((ty+1)*N/M)
  for(let y=y0;y<Math.max(y1,y0+1);y++)for(let x=x0;x<Math.max(x1,x0+1);x++){const cc=col[y]&&col[y][x];if(cc){r+=cc.r;g+=cc.g;b+=cc.b;a++}c++}
  if(a>c*0.4){const SC=5;for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((ty*SC+yy)*small.width+(tx*SC+xx))*4;small.data[di]=r/a;small.data[di+1]=g/a;small.data[di+2]=b/a;small.data[di+3]=255}}}
fs.writeFileSync('preview/dot/axo-small-view.png',PNG.sync.write(small))
console.log('HD trace N=128, opaque='+bsz)
