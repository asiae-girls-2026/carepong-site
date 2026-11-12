const { PNG } = require('pngjs')
const fs=require('fs')
const png=PNG.sync.read(fs.readFileSync('preview/dot/side-hd.png'));const N=png.width
const op=(x,y)=>png.data[(y*N+x)*4+3]>0
const bottomY=Array(N).fill(-1);let maxY=-1,minX=N,maxX=0
for(let x=0;x<N;x++)for(let y=0;y<N;y++)if(op(x,y)){bottomY[x]=y;if(y>maxY)maxY=y;if(x<minX)minX=x;if(x>maxX)maxX=x}
console.log('x range',minX+'-'+maxX,'maxY',maxY)
// print rise above lowest, every 3px
let s=''
for(let x=minX;x<=maxX;x+=3){const r=bottomY[x]<0?'--':(maxY-bottomY[x]);s+=String(r).padStart(3)}
console.log('rise profile (0=lowest foot), every3px:'); console.log(s)
