import fs from 'fs';
import { PNG } from 'pngjs';
const png = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const { width, height, data } = png;
function isGold(r,g,b){ return r>120 && g>85 && b<160 && r>b && (r-b)>40; }

const seed={x:715,y:500};
const visited=new Uint8Array(width*height);
const stack=[seed]; visited[seed.y*width+seed.x]=1;
let minX=width,maxX=-1,minY=height,maxY=-1,count=0;
while(stack.length){
  const {x,y}=stack.pop();
  const i=y*width+x;
  if(isGold(data[i],data[i+1],data[i+2])) continue;
  visited[i]=1; count++;
  if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const nx=x+dx, ny=y+dy, ni=ny*width+nx;
    if(ni>=0&&ni<width*height&&!visited[ni]){ visited[ni]=1; stack.push({x:nx,y:ny}); }
  }
}
console.log('count',count,'bbox X=['+minX+'..'+maxX+'] Y=['+minY+'..'+maxY+']');
let e0=0,e1=0,e2=0,e3=0;
for(let x=0;x<width;x++){ if(visited[x]) e0++; if(visited[(height-1)*width+x]) e1++; }
for(let y=0;y<height;y++){ if(visited[y*width]) e2++; if(visited[y*width+width-1]) e3++; }
console.log('visited col x=0:',e0,'col x=1023:',e3,'row y=0:',e2,'row y=1535:',e1);
