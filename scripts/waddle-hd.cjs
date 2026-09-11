const { PNG } = require('/Users/chaewon/desktop-pet/node_modules/pngjs')
const fs = require('fs')
const base = PNG.sync.read(fs.readFileSync('preview/dot/axo-hd.png'))
const N = base.width
const op=(d,x,y)=>d[(y*N+x)*4+3]>0
const bottomY=Array(N).fill(-1);let maxY=-1
for(let x=0;x<N;x++)for(let y=0;y<N;y++)if(op(base.data,x,y)){bottomY[x]=y;if(y>maxY)maxY=y}
const A=24,B=87,MID=Math.round((A+B)/2)
// lift columns in [c0,c1]: take bottom `seg` px, move up by `lift`
function frame(c0,c1,lift,seg){
  const out=new PNG({width:N,height:N});base.data.copy(out.data)
  for(let x=c0;x<=c1;x++){const by=bottomY[x];if(by<0)continue;const top=Math.max(0,by-seg+1)
    const buf=[];for(let y=top;y<=by;y++){const i=(y*N+x)*4;buf.push([out.data[i],out.data[i+1],out.data[i+2],out.data[i+3]])}
    for(let y=top;y<=by;y++)out.data[(y*N+x)*4+3]=0
    buf.forEach(([r,g,b,a],k)=>{const ny=top-lift+k;if(ny>=0&&a){const i=(ny*N+x)*4;out.data[i]=r;out.data[i+1]=g;out.data[i+2]=b;out.data[i+3]=a}})
  }
  return out
}
const fL=frame(A,MID,4,9)        // lift LEFT feet
const fR=frame(MID+1,B,4,9)      // lift RIGHT feet
fs.writeFileSync('preview/dot/axo-hd_wl.png',PNG.sync.write(fL))
fs.writeFileSync('preview/dot/axo-hd_wr.png',PNG.sync.write(fR))
// 3-up view: neutral | left-step | right-step
const SC=3,GAP=14,VW=N*SC*3+GAP*4,VH=N*SC+GAP*2
const V=new PNG({width:VW,height:VH});for(let i=0;i<V.data.length;i+=4){V.data[i]=238;V.data[i+1]=236;V.data[i+2]=243;V.data[i+3]=255}
function put(src,ox){for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=(y*N+x)*4;if(!src.data[i+3])continue;for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const di=((GAP+y*SC+yy)*VW+(ox+x*SC+xx))*4;V.data[di]=src.data[i];V.data[di+1]=src.data[i+1];V.data[di+2]=src.data[i+2];V.data[di+3]=255}}}
put(base,GAP);put(fL,GAP*2+N*SC);put(fR,GAP*3+N*SC*2)
fs.writeFileSync('preview/dot/waddle-check.png',PNG.sync.write(V))
console.log('waddle frames: neutral | L-step | R-step (MID='+MID+')')
