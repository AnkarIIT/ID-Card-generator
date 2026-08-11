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
while(stack.length){
  const {x,y}=stack.pop();
  const i=y*width+x;
  const {r,g,b}=px(x,y);
  if(isGold(r,g,b)) continue;
  visited[i]=1;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const nx=x+dx, ny=y+dy, ni=ny*width+nx;
    if(ni>=0&&ni<width*height&&!visited[ni]){ visited[ni]=1; stack.push({x:nx,y:ny}); }
  }
}
// find unreachable maroon within [460..990]x[130..880]
const unm=[];
for(let y=130;y<=880;y++) for(let x=460;x<=990;x++){
  const i=y*width+x;
  if(isMaroon(data[i],data[i+1],data[i+2]) && !visited[i]) unm.push([x,y]);
}
console.log('unreachable maroon count:',unm.length);
if(unm.length){
  let minX=1e9,maxX=-1,minY=1e9,maxY=-1;
  const byRow={};
  for(const [x,y] of unm){ if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; (byRow[y]=byRow[y]||[]).push(x); }
  console.log('bbox X=['+minX+'..'+maxX+'] Y=['+minY+'..'+maxY+']');
  console.log('row hist (sample):');
  for(let y=minY;y<=maxY;y++){
    const xs=byRow[y];
    if(xs&&xs.length) console.log('y='+y,'n='+xs.length,'x=['+Math.min(...xs)+'..'+Math.max(...xs)+']');
  }
}
// ASCII of the right lattice region to see structure
const step=2;
console.log('\nASCII region x=[930..1020] y=[390..700] (G=gold, r=reachable-maroon, R=unreachable-maroon, .=dark, space=other):');
for(let y=390;y<=700;y+=step){
  let line='';
  for(let x=930;x<=1020;x+=step){
    const i=y*width+x;
    const {r,g,b}=px(x,y);
    if(isGold(r,g,b)) line+='G';
    else if(isMaroon(r,g,b)) line+= visited[i]?'r':'R';
    else if(isDark(r,g,b)) line+='.';
    else line+=' ';
  }
  console.log(String(y).padStart(3)+' '+line);
}
