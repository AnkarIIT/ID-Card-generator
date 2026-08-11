import fs from 'fs';
import { PNG } from 'pngjs';
const png = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const { width, height, data } = png;

function px(x,y){ if(x<0||x>=width||y<0||y>=height) return {r:0,g:0,b:0}; const i=(y*width+x)*4; return {r:data[i],g:data[i+1],b:data[i+2]}; }
function isGold(r,g,b){ return r>120 && g>85 && b<160 && r>b && (r-b)>40; }
function isMaroon(r,g,b){ return r>100 && g<80 && b>25 && b<130; }

const seed={x:715,y:500};
const visited=new Uint8Array(width*height);
const stack=[seed]; visited[seed.y*width+seed.x]=1;
let leaked=false;
let count=0; let minX=width,maxX=-1,minY=height,maxY=-1;
while(stack.length){
  const {x,y}=stack.pop();
  const i=y*width+x;
  const {r,g,b}=px(x,y);
  if(isGold(r,g,b)) continue;
  if(x<=10||x>=width-11||y<=10||y>=height-11){ leaked=true; continue; }
  visited[i]=1;
  count++;
  if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const nx=x+dx, ny=y+dy;
    const ni=ny*width+nx;
    if(ni>=0&&ni<width*height&&!visited[ni]){ visited[ni]=1; stack.push({x:nx,y:ny}); }
  }
}
console.log('Fill (all non-gold reachable):',count,'px');
console.log('bbox X=['+minX+'..'+maxX+'] Y=['+minY+'..'+maxY+']');
console.log('leaked to canvas edge:',leaked);

let maroonOutside=0, maroonTotal=0;
for(let y=minY;y<=maxY;y++) for(let x=minX;x<=maxX;x++){
  const i=y*width+x;
  if(isMaroon(data[i],data[i+1],data[i+2])){ maroonTotal++;
    if(!visited[i]) maroonOutside++;
  }
}
console.log('maroon in bbox:',maroonTotal,'not covered by fill:',maroonOutside);

function rowRange(y){ let lo=-1,hi=-1; for(let x=400;x<=1000;x++){ if(visited[y*width+x]){ if(lo===-1)lo=x; hi=x; } } return lo===-1?null:[lo,hi]; }
console.log('\nTop rows:'); for(let y=140;y<=160;y++) console.log('y='+y, JSON.stringify(rowRange(y)));
console.log('\nBottom rows:'); for(let y=838;y<=858;y++) console.log('y='+y, JSON.stringify(rowRange(y)));
console.log('\nProtrusion rows (left x<505 or right x>920):');
for(let y=390;y<=500;y+=2){ const r=rowRange(y); if(r&&(r[0]<505||r[1]>920)) console.log('y='+y, JSON.stringify(r)); }
