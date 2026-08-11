import fs from 'fs';
import { PNG } from 'pngjs';
const png = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const { width, height, data } = png;
function px(x,y){ if(x<0||x>=width||y<0||y>=height) return {r:0,g:0,b:0}; const i=(y*width+x)*4; return {r:data[i],g:data[i+1],b:data[i+2]}; }
function isGold(r,g,b){ return r>120 && g>85 && b<160 && r>b && (r-b)>40; }
function isMaroon(r,g,b){ return r>100 && g<80 && b>25 && b<130; }
function isDark(r,g,b){ return r<45 && g<65 && b<55; }

const seed={x:715,y:500};
const visited=new Uint8Array(width*height);
const stack=[seed]; visited[seed.y*width+seed.x]=1;
let minX=width,maxX=-1,minY=height,maxY=-1;
while(stack.length){
  const {x,y}=stack.pop();
  const {r,g,b}=px(x,y);
  if(isGold(r,g,b)) continue;
  visited[y*width+x]=1;
  if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const nx=x+dx,ny=y+dy;
    if(nx<0||nx>=width||ny<0||ny>=height) continue;
    if(visited[ny*width+nx]) continue;
    visited[ny*width+nx]=1; stack.push({x:nx,y:ny});
  }
}
console.log('MASK bbox X=['+minX+'..'+maxX+'] Y=['+minY+'..'+maxY+']  total='+visited.reduce((a,b)=>a+b,0));

// corrected ASCII, full shape x=[450..1010] y=[120..880], step=2
const step=2;
for(let y=120;y<=880;y+=step){
  let line='';
  for(let x=450;x<=1010;x+=step){
    const i=y*width+x;
    if(visited[i]){ line+='#'; continue; }
    const {r,g,b}=px(x,y);
    if(isGold(r,g,b)) line+='G';
    else if(isMaroon(r,g,b)) line+='M';
    else if(isDark(r,g,b)) line+='.';
    else line+=' ';
  }
  console.log(String(y).padStart(3)+' '+line.replace(/ +$/,''));
}
