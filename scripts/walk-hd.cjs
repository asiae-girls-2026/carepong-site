const { PNG } = require('pngjs')
const fs = require('fs')
const base = PNG.sync.read(fs.readFileSync('preview/dot/axo-hd.png'))
const N = base.width
const op=(x,y)=>base.data[(y*N+x)*4+3]>0
const bottomY=Array(N).fill(-1); let maxY=-1,minX=N,maxX=0
for(let x=0;x<N;x++)for(let y=0;y<N;y++)if(op(x,y)){bottomY[x]=y;if(y>maxY)maxY=y;if(x<minX)minX=x;if(x>maxX)maxX=x}
// leg = columns whose bottom reaches near the lowest, separated by higher gaps
const thr=maxY-5
const legCol=bottomY.map(b=>b>=thr)
const clusters=[];let s=-1
for(let x=0;x<N;x++){if(legCol[x]){if(s<0)s=x}else{if(s>=0){clusters.push([s,x-1]);s=-1}}}
if(s>=0)clusters.push([s,N-1])
const legs=clusters.filter(([a,b])=>b-a+1>=3)
console.log('maxY',maxY,'silhouette x',minX+'-'+maxX)
console.log('leg clusters(>=3w):', legs.map(([a,b])=>`${a}-${b}(${b-a+1})`).join('  '))
// also: bottom contour sampled every 6px to see shape
let prof=''; for(let x=minX;x<=maxX;x+=6) prof+=(maxY-bottomY[x])+' '
console.log('bottom rise profile (every6px, 0=lowest):', prof)
