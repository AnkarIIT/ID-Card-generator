import fs from 'fs';
import { PNG } from 'pngjs';
const tpl = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const W=tpl.width;
function sample(x,y){
  const i=(y*W+x)*4;
  return {r:tpl.data[i],g:tpl.data[i+1],b:tpl.data[i+2],a:tpl.data[i+3]};
}
// scan the region x=[560..760] y=[500..640] to see what's there
function isGold(r,g,b){ return r>120 && g>85 && b<160 && r>b && (r-b)>40; }
function isMaroon(r,g,b){ return r>100 && g<80 && b>25 && b<130; }
function isDark(r,g,b){ return r<45 && g<65 && b<55; }
let g=0,m=0,d=0,o=0,total=0;
for(let y=500;y<=640;y++) for(let x=560;x<=760;x++){
  const p=sample(x,y); total++;
  if(isGold(p.r,p.g,p.b)) g++;
  else if(isMaroon(p.r,p.g,p.b)) m++;
  else if(isDark(p.r,p.g,p.b)) d++;
  else o++;
}
console.log('region x[560..760] y[500..640]: gold='+g+' maroon='+m+' dark='+d+' other='+o);
console.log('sample (600,560):', JSON.stringify(sample(600,560)));
console.log('sample (650,560):', JSON.stringify(sample(650,560)));
console.log('sample (700,520):', JSON.stringify(sample(700,520)));
console.log('sample (650,600):', JSON.stringify(sample(650,600)));
