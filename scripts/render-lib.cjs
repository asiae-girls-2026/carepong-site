const { PNG } = require('pngjs')
const fs = require('fs')
function hex(c){ return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)] }
function save(g, PAL, scale, path, bg){
  const H=g.length, W=g[0].length
  const out=new PNG({width:W*scale,height:H*scale})
  if(bg){ const [br,bgc,bb]=hex(bg); for(let i=0;i<out.data.length;i+=4){out.data[i]=br;out.data[i+1]=bgc;out.data[i+2]=bb;out.data[i+3]=255} }
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      const c=PAL[g[y][x]]
      if(!c) continue
      const [r,gr,b]=hex(c)
      for(let yy=0;yy<scale;yy++){
        for(let xx=0;xx<scale;xx++){
          const di=((y*scale+yy)*out.width+(x*scale+xx))*4
          out.data[di]=r; out.data[di+1]=gr; out.data[di+2]=b; out.data[di+3]=255
        }
      }
    }
  }
  fs.mkdirSync(require('path').dirname(path),{recursive:true})
  fs.writeFileSync(path, PNG.sync.write(out))
}
module.exports = { save }
