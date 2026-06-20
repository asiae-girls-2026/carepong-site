const { PNG } = require('/Users/chaewon/desktop-pet/node_modules/pngjs')
const fs = require('fs')
const base = PNG.sync.read(fs.readFileSync('preview/dot/axo64.png'))
const N = base.width
const op = (d,x,y)=> d[(y*N+x)*4+3] > 0
// bottomY per column
const bottomY = Array(N).fill(-1)
let maxY = -1
for (let x=0;x<N;x++) for (let y=0;y<N;y++) if (op(base.data,x,y)){ bottomY[x]=y; if(y>maxY)maxY=y }
// leg columns = reach near the lowest point
const thr = maxY - 3
const legCol = bottomY.map(b => b>=thr)
// group into leg clusters
const legs=[]; let s=-1
for(let x=0;x<N;x++){ if(legCol[x]){ if(s<0)s=x } else { if(s>=0){legs.push([s,x-1]);s=-1} } }
if(s>=0) legs.push([s,N-1])
// keep clusters wide enough (>=2 cols)
const realLegs = legs.filter(([a,b])=>b-a+1>=2)
console.log('maxY',maxY,'legs:', realLegs.map(([a,b])=>a+'-'+b).join('  '))
// build a walk frame: lift given leg indices by `lift` px
function makeFrame(liftIdx, lift){
  const out = new PNG({width:N,height:N}); base.data.copy(out.data)
  realLegs.forEach(([a,b],i)=>{ if(!liftIdx.includes(i)) return
    for(let x=a;x<=b;x++){
      const by=bottomY[x]; const top=Math.max(0,by-4)
      // copy the bottom segment up by `lift`
      const seg=[]
      for(let y=top;y<=by;y++){ const i4=(y*N+x)*4; seg.push([out.data[i4],out.data[i4+1],out.data[i4+2],out.data[i4+3]]) }
      // clear original segment
      for(let y=top;y<=by;y++){ out.data[(y*N+x)*4+3]=0 }
      // paste shifted up
      seg.forEach((px,k)=>{ const ny=top-lift+k; if(ny>=0){ const i4=(ny*N+x)*4; out.data[i4]=px[0];out.data[i4+1]=px[1];out.data[i4+2]=px[2];out.data[i4+3]=px[3] } })
    }
  })
  return out
}
// alternate legs by index parity
const idxA = realLegs.map((_,i)=>i).filter(i=>i%2===0)
const idxB = realLegs.map((_,i)=>i).filter(i=>i%2===1)
const fA = makeFrame(idxA, 2)
const fB = makeFrame(idxB, 2)
fs.writeFileSync('preview/dot/axo64_w0.png', PNG.sync.write(fA))
fs.writeFileSync('preview/dot/axo64_w1.png', PNG.sync.write(fB))
// side-by-side scaled view to verify
const SC=5, GAP=20, VW=N*SC*2+GAP*3, VH=N*SC+GAP*2
const V=new PNG({width:VW,height:VH}); for(let i=0;i<V.data.length;i+=4){V.data[i]=238;V.data[i+1]=236;V.data[i+2]=243;V.data[i+3]=255}
function blit(src,ox){ for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=(y*N+x)*4; if(!src.data[i+3])continue; for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((GAP+y*SC+yy)*VW+(ox+x*SC+xx))*4;V.data[di]=src.data[i];V.data[di+1]=src.data[i+1];V.data[di+2]=src.data[i+2];V.data[di+3]=255}}}
blit(fA,GAP); blit(fB,GAP*2+N*SC)
fs.writeFileSync('preview/dot/walk-compare.png', PNG.sync.write(V))
console.log('walk frames + compare written')
