const { PNG } = require('/Users/chaewon/desktop-pet/node_modules/pngjs')
const fs = require('fs')

function load(p){ return PNG.sync.read(fs.readFileSync(p)) }
function tightBox(png){
  let x0=png.width,y0=png.height,x1=0,y1=0
  for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){
    if(png.data[(y*png.width+x)*4+3]>20){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y }
  }
  return {x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}
}
// alpha-weighted area downscale to tw x th -> returns {data:[{r,g,b,a}], tw, th}
function downscale(png, box, th){
  const tw = Math.max(1, Math.round(box.w/box.h*th))
  const out = new Array(tw*th)
  const bw = box.w/tw, bh = box.h/th
  for(let ty=0;ty<th;ty++)for(let tx=0;tx<tw;tx++){
    let r=0,g=0,b=0,aw=0,asum=0,cnt=0
    const sx0=box.x+Math.floor(tx*bw), sx1=box.x+Math.ceil((tx+1)*bw)
    const sy0=box.y+Math.floor(ty*bh), sy1=box.y+Math.ceil((ty+1)*bh)
    for(let sy=sy0;sy<sy1;sy++)for(let sx=sx0;sx<sx1;sx++){
      const i=(sy*png.width+sx)*4, a=png.data[i+3]/255
      r+=png.data[i]*a; g+=png.data[i+1]*a; b+=png.data[i+2]*a; aw+=a; asum+=png.data[i+3]; cnt++
    }
    const col = aw>0.001 ? {r:r/aw,g:g/aw,b:b/aw} : {r:0,g:0,b:0}
    out[ty*tw+tx] = { ...col, a: cnt? asum/cnt : 0 }
  }
  return { data: out, tw, th }
}
function quantize(ds, k){
  const pts = ds.data.filter(p=>p.a>120)
  if(pts.length===0) return
  // init centers spread by luminance
  pts.sort((a,b)=>(a.r+a.g+a.b)-(b.r+b.g+b.b))
  let cen=[]; for(let i=0;i<k;i++) cen.push({...pts[Math.floor(i/(k-1)*(pts.length-1))]})
  for(let it=0; it<10; it++){
    const acc=cen.map(()=>({r:0,g:0,b:0,n:0}))
    for(const p of pts){ let bi=0,bd=1e9; for(let c=0;c<cen.length;c++){const dr=p.r-cen[c].r,dg=p.g-cen[c].g,db=p.b-cen[c].b,d=dr*dr+dg*dg+db*db; if(d<bd){bd=d;bi=c}} const A=acc[bi]; A.r+=p.r;A.g+=p.g;A.b+=p.b;A.n++ }
    for(let c=0;c<cen.length;c++) if(acc[c].n){ cen[c]={r:acc[c].r/acc[c].n,g:acc[c].g/acc[c].n,b:acc[c].b/acc[c].n} }
  }
  for(const p of ds.data){ if(p.a<=120){p.a=0;continue} p.a=255; let bi=0,bd=1e9; for(let c=0;c<cen.length;c++){const dr=p.r-cen[c].r,dg=p.g-cen[c].g,db=p.b-cen[c].b,d=dr*dr+dg*dg+db*db; if(d<bd){bd=d;bi=c}} p.r=Math.round(cen[bi].r);p.g=Math.round(cen[bi].g);p.b=Math.round(cen[bi].b) }
}
function toPNG(ds){
  const out=new PNG({width:ds.tw,height:ds.th})
  for(let i=0;i<ds.data.length;i++){ const p=ds.data[i]; out.data[i*4]=p.r||0;out.data[i*4+1]=p.g||0;out.data[i*4+2]=p.b||0;out.data[i*4+3]=p.a||0 }
  return out
}
function pixelate(src, th, k){ const png=load(src); const box=tightBox(png); const ds=downscale(png,box,th); quantize(ds,k); return ds }

const TH = Number(process.argv[2]||76), K = Number(process.argv[3]||22)
fs.mkdirSync('preview/pixel',{recursive:true})
const sets = { axo:['axo-1','axo-2','axo-3','axo-4','axo-5'], cat:['cat-1','cat-2','cat-3','cat-4','cat-5'] }
const results = {}
for(const [name, files] of Object.entries(sets)){
  results[name]=[]
  for(const f of files){ const ds=pixelate('preview/sprites/'+f+'.png', TH, K); fs.writeFileSync('preview/pixel/'+f+'.png', PNG.sync.write(toPNG(ds))); results[name].push(ds) }
}
// contact sheet: 2 rows, scale 3x, light bg
const SC=3, GAP=12, CELLH=TH*SC+GAP
const maxW = Math.max(...Object.values(results).flat().map(d=>d.tw))
const cols=5, CW=maxW*SC+GAP
const sheet=new PNG({width:CW*cols+GAP, height:CELLH*2+GAP})
for(let i=0;i<sheet.data.length;i+=4){sheet.data[i]=238;sheet.data[i+1]=238;sheet.data[i+2]=242;sheet.data[i+3]=255}
function blit(ds,ox,oy){ for(let y=0;y<ds.th;y++)for(let x=0;x<ds.tw;x++){const p=ds.data[y*ds.tw+x]; if(!p.a)continue; for(let yy=0;yy<SC;yy++)for(let xx=0;xx<SC;xx++){const dx=ox+x*SC+xx,dy=oy+y*SC+yy; if(dx<0||dy<0||dx>=sheet.width||dy>=sheet.height)continue; const di=(dy*sheet.width+dx)*4; sheet.data[di]=p.r;sheet.data[di+1]=p.g;sheet.data[di+2]=p.b;sheet.data[di+3]=255}}}
;['axo','cat'].forEach((name,ri)=>{ results[name].forEach((ds,ci)=>{ const ox=GAP+ci*CW+Math.floor((maxW-ds.tw)*SC/2); const oy=GAP+ri*CELLH+(TH-ds.th)*SC; blit(ds,ox,oy) }) })
fs.writeFileSync('preview/pixel-contact.png', PNG.sync.write(sheet))
console.log('done TH='+TH+' K='+K+' -> preview/pixel/*.png + preview/pixel-contact.png ; tw sample axo5='+results.axo[4].tw)
