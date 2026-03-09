let speed = 20;
const grid = document.getElementById("grid");

let rows = 20;
let cols = 20;

let mode = "";

let startNode = null;
let endNode = null;

let nodes = [];
let weights = new Map();

let isDraggingStart = false;
let isDraggingEnd = false;

/* ---------- GRID CREATE ---------- */

function createGrid(){

for(let r=0;r<rows;r++){

let row=[];

for(let c=0;c<cols;c++){

let node=document.createElement("div");
node.classList.add("node");

node.dataset.row=r;
node.dataset.col=c;

node.addEventListener("click",handleClick);

/* DRAG EVENTS */

node.addEventListener("mousedown",startDrag);
node.addEventListener("mouseover",dragMove);
node.addEventListener("mouseup",stopDrag);

/* RIGHT CLICK = WEIGHT NODE */

node.addEventListener("contextmenu",function(e){

e.preventDefault();

if(!node.classList.contains("start") && !node.classList.contains("end")){

node.classList.remove("wall");
node.classList.toggle("weight");

if(node.classList.contains("weight")){
weights.set(node,5);
}else{
weights.delete(node);
}

}

});

grid.appendChild(node);
row.push(node);

}

nodes.push(row);

}

}

createGrid();

/* ---------- MODE BUTTONS ---------- */

function setStart(){
mode="start";
}

function setEnd(){
mode="end";
}

function setWall(){
mode="wall";
}

/* ---------- CLICK ---------- */

function handleClick(){

if(mode==="start"){

if(startNode) startNode.classList.remove("start");

this.classList.remove("wall","end","weight");
this.classList.add("start");

startNode=this;

}

else if(mode==="end"){

if(endNode) endNode.classList.remove("end");

this.classList.remove("wall","start","weight");
this.classList.add("end");

endNode=this;

}

else if(mode==="wall"){

if(!this.classList.contains("start") && !this.classList.contains("end")){

this.classList.remove("weight");
weights.delete(this);

this.classList.toggle("wall");

}

}

}

/* ---------- SPEED SLIDER ---------- */

document.getElementById("speedSlider").addEventListener("input",function(){
speed=this.value;
});

/* ---------- NEIGHBORS (WITH DIAGONAL) ---------- */

function getNeighbors(r,c){

let list=[];

if(r>0) list.push(nodes[r-1][c]);
if(r<rows-1) list.push(nodes[r+1][c]);
if(c>0) list.push(nodes[r][c-1]);
if(c<cols-1) list.push(nodes[r][c+1]);

/* DIAGONAL */

if(r>0 && c>0) list.push(nodes[r-1][c-1]);
if(r>0 && c<cols-1) list.push(nodes[r-1][c+1]);
if(r<rows-1 && c>0) list.push(nodes[r+1][c-1]);
if(r<rows-1 && c<cols-1) list.push(nodes[r+1][c+1]);

return list;

}

/* ---------- BFS ---------- */

function runBFS(){

if(!startNode || !endNode){
alert("Set start and end node");
return;
}

let queue=[];
let visited=new Set();
let parent=new Map();
let order=[];

queue.push(startNode);
visited.add(startNode);

while(queue.length>0){

let node=queue.shift();
order.push(node);

if(node===endNode){
animate(order,parent,"BFS");
return;
}

let r=parseInt(node.dataset.row);
let c=parseInt(node.dataset.col);

for(let n of getNeighbors(r,c)){

if(!visited.has(n) && !n.classList.contains("wall")){

visited.add(n);
parent.set(n,node);
queue.push(n);

}

}

}

}

/* ---------- DIJKSTRA ---------- */

function runDijkstra(){

if(!startNode || !endNode){
alert("Set start and end node");
return;
}

let dist=new Map();
let parent=new Map();
let visited=new Set();
let order=[];
let pq=[startNode];

dist.set(startNode,0);

while(pq.length>0){

pq.sort((a,b)=>(dist.get(a)||Infinity)-(dist.get(b)||Infinity));

let node=pq.shift();

if(visited.has(node)) continue;

visited.add(node);
order.push(node);

if(node===endNode){
animate(order,parent,"Dijkstra");
return;
}

let r=parseInt(node.dataset.row);
let c=parseInt(node.dataset.col);

for(let n of getNeighbors(r,c)){

if(n.classList.contains("wall")) continue;

let weight=weights.get(n)||1;

let newDist=(dist.get(node)||0)+weight;

if(newDist<(dist.get(n)||Infinity)){

dist.set(n,newDist);
parent.set(n,node);
pq.push(n);

}

}

}

}

/* ---------- A STAR ---------- */

function heuristic(a,b){

let r1=parseInt(a.dataset.row);
let c1=parseInt(a.dataset.col);

let r2=parseInt(b.dataset.row);
let c2=parseInt(b.dataset.col);

return Math.abs(r1-r2)+Math.abs(c1-c2);

}

function runAStar(){

if(!startNode || !endNode){
alert("Set start and end node");
return;
}

let open=[startNode];

let gScore=new Map();
let fScore=new Map();

let parent=new Map();
let visited=new Set();
let order=[];

gScore.set(startNode,0);
fScore.set(startNode,heuristic(startNode,endNode));

while(open.length>0){

open.sort((a,b)=>(fScore.get(a)||Infinity)-(fScore.get(b)||Infinity));

let node=open.shift();

if(visited.has(node)) continue;

visited.add(node);
order.push(node);

if(node===endNode){
animate(order,parent,"A*");
return;
}

let r=parseInt(node.dataset.row);
let c=parseInt(node.dataset.col);

for(let n of getNeighbors(r,c)){

if(n.classList.contains("wall")) continue;

let weight=weights.get(n)||1;

let temp=(gScore.get(node)||0)+weight;

if(temp<(gScore.get(n)||Infinity)){

parent.set(n,node);
gScore.set(n,temp);
fScore.set(n,temp+heuristic(n,endNode));

open.push(n);

}

}

}

}

/* ---------- ANIMATION ---------- */

function animate(order,parent,algo){

document.getElementById("algoName").textContent=algo;
document.getElementById("visitedCount").textContent=order.length;

for(let i=0;i<order.length;i++){

setTimeout(()=>{

let node=order[i];

if(!node.classList.contains("start") && !node.classList.contains("end")){
node.classList.add("visited");
}

if(i===order.length-1){
drawPath(parent);
}

},speed*i);

}

}

/* ---------- DRAW PATH ---------- */

function drawPath(parent){

let path=[];
let current=endNode;

while(current!==startNode){

path.push(current);
current=parent.get(current);

}

path.reverse();

document.getElementById("pathLength").textContent=path.length;

for(let i=0;i<path.length;i++){

setTimeout(()=>{

let node=path[i];

if(!node.classList.contains("start") && !node.classList.contains("end")){
node.classList.add("path");
}

},speed*2*i);

}

}

/* ---------- CLEAR ---------- */

function clearGrid(){

document.querySelectorAll(".node").forEach(n=>{
n.classList.remove("visited","path","wall","start","end","weight");
});

weights.clear();

startNode=null;
endNode=null;

}

/* ---------- MAZE ---------- */

function generateMaze(){

clearGrid();

for(let r=0;r<rows;r++){

for(let c=0;c<cols;c++){

let node=nodes[r][c];

if(Math.random()<0.3){
node.classList.add("wall");
}

}

}

}

/* ---------- DARK MODE ---------- */

function toggleDarkMode(){
document.body.classList.toggle("dark");
}

/* ---------- DRAG FEATURE ---------- */

function startDrag(){

if(this===startNode){
isDraggingStart=true;
}

if(this===endNode){
isDraggingEnd=true;
}

}

function dragMove(){

if(isDraggingStart){

if(this!==endNode && !this.classList.contains("wall")){

startNode.classList.remove("start");
this.classList.add("start");
startNode=this;

}

}

if(isDraggingEnd){

if(this!==startNode && !this.classList.contains("wall")){

endNode.classList.remove("end");
this.classList.add("end");
endNode=this;

}

}

}

function stopDrag(){

isDraggingStart=false;
isDraggingEnd=false;

}
function stopDrag(){

isDraggingStart=false;
isDraggingEnd=false;

}

/* ---------- ALGORITHM RACE ---------- */

function runRace(){

if(!startNode || !endNode){
alert("Set start and end node");
return;
}

/* BFS TIME */

let t1 = performance.now();
runBFS();
let t2 = performance.now();

let bfsTime = (t2 - t1).toFixed(2);

/* DIJKSTRA TIME */

let t3 = performance.now();
runDijkstra();
let t4 = performance.now();

let dijTime = (t4 - t3).toFixed(2);

/* ASTAR TIME */

let t5 = performance.now();
runAStar();
let t6 = performance.now();

let astarTime = (t6 - t5).toFixed(2);

/* SHOW TIMES */

document.getElementById("bfsTime").textContent = bfsTime + " ms";
document.getElementById("dijTime").textContent = dijTime + " ms";
document.getElementById("astarTime").textContent = astarTime + " ms";

/* FIND WINNER */

let min = Math.min(bfsTime,dijTime,astarTime);

let winner = "";

if(min == bfsTime) winner = "BFS";
if(min == dijTime) winner = "Dijkstra";
if(min == astarTime) winner = "A*";

document.getElementById("winner").textContent = winner;

}