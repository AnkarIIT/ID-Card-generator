import fs from 'fs';
import { PNG } from 'pngjs';
const png = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const { width, height, data } = png;
function crop(x0,y0,x1,y1,scale){
  const w=x1-x0,h=y1-y0;
  const out=new PNG({width:Math.round(w/scale),height:Math.round(h/scale)});
  for(let y=0;y<out.height;y++) for(let x=0;x<out.width;x++){
    const sx=x0+x*scale, sy=y0+y*scale;
    const i=(sy*width+sx)*4, j=(y*out.width+x)*4;
    out.data[j]=data[i]; out.data[j+1]=data[i+1]; out.data[j+2]=data[i+2]; out.data[j+3]=255;
  }
  return out;
}
fs.writeFileSync('./src/images/_crop_portrait.png', PNG.sync.write(crop(430,100,1020,880,1)));
fs.writeFileSync('./src/images/_crop_apex.png', PNG.sync.write(crop(560,120,760,260,1)));
fs.writeFileSync('./src/images/_crop_bottom.png', PNG.sync.write(crop(480,800,940,880,1)));
fs.writeFileSync('./src/images/_crop_flare.png', PNG.sync.write(crop(430,400,1020,500,1)));
console.log('crops saved');
