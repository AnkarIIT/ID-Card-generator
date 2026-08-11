import fs from 'fs';
import { PNG } from 'pngjs';
const png = PNG.sync.read(fs.readFileSync('./src/images/front.png'));
const { width, height, data } = png;
function px(x,y){ const i=(y*width+x)*4; return {r:data[i],g:data[i+1],b:data[i+2]}; }
function isGold(r,g,b){ return r>120 && g>85 && b<160 && r>b && (r-b)>40; }
function isMaroon(r,g,b){ return r>100 && g<80 && b>25 && b<130; }
function isDark(r,g,b){ return r<45 && g<65 && b<55; }
const seed={x:715,y:500};
const visited=new Uint8Array(width*height);
const stack=[seed]; visited[seed.y*width+seed.x]=1;
while(stack.length){
  const {x,y}=stack.pop();
  const {r,g,b}=px(x,y);
  if(isGold(r,g,b)) continue;
  visited[y*width+x]=1;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const nx=x+dx,ny=y+dy;
    if(nx<0||nx>=width||ny<0||ny>=height) continue;
    if(visited[ny*width+nx]) continue;
    visited[ny*width+nx]=1; stack.push({x:nx,y:ny});
  }
}
// zoom apex x=[640..760] y=[120..185]
console.log('Apex zoom  x=[640..760]  (F=fill-in-mask, M=maroon-in-mask, G=gold, .=dark, _=not-in-mask-other)');
for(let y=120;y<=185;y++){
  let line='';
  for(let x=640;x<=760;x++){
    const i=y*width+x;
    if(visited[i]){ const {r,g,b}=px(x,y); line+= isMaroon(r,g,b)?'M': (isDark(r,g,b)?'.':'F'); continue; }
    const {r,g,b}=px(x,y);
    if(isGold(r,g,b)) line+='G';
    else if(isMaroon(r,g,b)) line+='m';
    else if(isDark(r,g,b)) line+='.';
    else line+='_';
  }
  console.log(String(y).padStart(3)+' '+line);
}
