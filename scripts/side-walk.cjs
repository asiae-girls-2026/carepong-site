const { PNG } = require('pngjs')
const fs=require('fs')
const base=PNG.sync.read(fs.readFileSync('preview/dot/side-hd.png'));const N=base.width
const bottomY=Array(N).fill(-1)
for(let x=0;x<N;x++)for(let y=0;y<N;y++)if(base.data[(y*N+x)*4+3]>0)bottomY[x]=y
// manual leg groups (front pair / back pair), from render
const FRONT=[34,60], BACK=[66,102]
function frame(group,lift,seg){const out=new PNG({width:N,height:N});base.data.copy(out.data)
  for(let x=group[0];x<=group[1];x++){const by=bottomY[x];if(by<0)continue;const top=Math.max(0,by-seg+1)
    const buf=[];for(let y=top;y<=by;y++){const i=(y*N+x)*4;buf.push([out.data[i],out.data[i+1],out.data[i+2],out.data[i+3]])}
    for(let y=top;y<=by;y++)out.data[(y*N+x)*4+3]=0
    buf.forEach(([r,g,b,a],k)=>{const ny=top-lift+k;if(ny>=0&&a){const i=(ny*N+x)*4;out.data[i]=r;out.data[i+1]=g;out.data[i+2]=b;out.data[i+3]=a}})}
  return out}
const fA=frame(FRONT,8,13), fB=frame(BACK,8,13)
fs.writeFileSync('preview/dot/side-hd_a.png',PNG.sync.write(fA))
fs.writeFileSync('preview/dot/side-hd_b.png',PNG.sync.write(fB))
const SC=3,GAP=14,VW=N*SC*3+GAP*4,VH=N*SC+GAP*2,V=new PNG({width:VW,height:VH})
for(let i=0;i<V.data.length;i+=4){V.data[i]=238;V.data[i+1]=236;V.data[i+2]=243;V.data[i+3]=255}
function put(src,ox){for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=(y*N+x)*4;if(!src.data[i+3])continue;for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((GAP+y*SC+yy)*VW+(ox+x*SC+xx))*4;V.data[di]=src.data[i];V.data[di+1]=src.data[i+1];V.data[di+2]=src.data[i+2];V.data[di+3]=255}}}
put(base,GAP);put(fA,GAP*2+N*SC);put(fB,GAP*3+N*SC*2)
fs.writeFileSync('preview/dot/side-walk-check.png',PNG.sync.write(V))
console.log('side walk frames: neutral | frontlift | backlift')
