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
  if(isGold(data[i],data[i+1],data[i+2])) continue;
  visited[i]=1;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const nx=x+dx, ny=y+dy, ni=ny*width+nx;
    if(ni>=0&&ni<width*height&&!visited[ni]){ visited[ni]=1; stack.push({x:nx,y:ny}); }
  }
}

// replicate CARD_LAYOUT.portrait.path polygon
function cubic(p0,p1,p2,p3,t){const u=1-t;return u*u*u*p0+3*u*u*t*p1+3*u*t*t*p2+t*t*t*p3;}
const pts=[];
const s=60;
for(let i=0;i<=s;i++){const t=i/s;pts.push([cubic(513,545,620,667,t),cubic(240,195,140,110,t)]);}
for(let i=0;i<=s;i++){const t=i/s;pts.push([cubic(667,715,785,845,t),cubic(110,118,165,235,t)]);}
for(let i=0;i<=s;i++){const t=i/s;pts.push([cubic(845,878,900,910,t),cubic(235,275,320,390,t)]);}
pts.push([910,840],[513,840]);
function inPath(x,y){let inb=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];const inter=(yi>y)!==(yj>y)&&x<((xj-xi)*(y-yi))/(yj-yi)+xi;if(inter)inb=!inb;}return inb;}

// ASCII full arch x=[430..1020] y=[120..900], step 2
// chars: # = reachable interior, G = gold, M = maroon unreachable, H = old-path-in but not interior, . = dark, space = other
const step=2;
for(let y=120;y<=900;y+=step){
  let line='';
  for(let x=430;x<=1020;x+=step){
    const i=y*width+x;
    if(visited[i]){ line+='#'; continue; }
    const {r,g,b}=px(x,y);
    if(isGold(r,g,b)) line+='G';
    else if(isMaroon(r,g,b)) line+='M';
    else if(isDark(r,g,b)) line+='.';
    else if(inPath(x+0.5,y+0.5)) line+='H';
    else line+=' ';
  }
  console.log(String(y).padStart(3)+' '+line);
}
