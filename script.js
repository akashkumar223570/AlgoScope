const $=s=>document.querySelector(s),INF=Infinity,f=x=>x==INF?"+∞":x==-INF?"−∞":x;
const A={
bfs:["Breadth-First Search","Uninformed","graph","Expands the shallowest frontier node first, so the search spreads in rings around the start.","Queue (FIFO)","Finds the fewest-edge path; simple.","Frontier can hold a whole level; ignores edge weights.","O(V+E)","O(V)","Yes, on finite graphs","Only when every edge costs the same","Web crawling, social-network distance, puzzles"],
dfs:["Depth-First Search","Uninformed","graph","Follows one branch as deep as possible, then backtracks to the most recent unexplored branch.","Stack (LIFO)","Tiny memory; good for exploring everything.","Can return a long path; can dive forever in infinite spaces.","O(V+E)","O(V)","Yes, with a visited set on finite graphs","No","Maze solving, cycle detection, topological sort"],
greedy:["Greedy Best-First Search","Informed","graph","Always expands the frontier node with the smallest heuristic h(n), the estimated distance to the goal.","Priority queue ordered by h","Often very fast; few expansions.","Ignores the cost so far, so paths can be poor and it can be misled.","O(b^m) worst case","O(b^m)","Yes, with a visited set on finite graphs","No","Quick route hints, game AI where speed beats quality"],
astar:["A* Search","Informed","graph","Expands the node with the lowest f(n) = g(n) + h(n): cost so far plus estimated cost to go.","Priority queue ordered by f","Optimal and efficient with a good heuristic.","Stores every generated node; needs a good h.","O(b^d) worst case","O(b^d)","Yes","Yes, if h never overestimates (admissible)","GPS navigation, robotics, game pathfinding"],
dijkstra:["Dijkstra’s Shortest Path","Graph optimization","graph","Settles nodes in order of distance from the source and relaxes edges to improve neighbours’ distances.","Priority queue ordered by distance","Optimal paths from the source to every node.","Explores in all directions; no negative weights.","O((V+E) log V)","O(V)","Yes","Yes, for non-negative weights","Network routing, maps, logistics"],
prim:["Prim’s Minimum Spanning Tree","Graph optimization","graph","Grows one tree from the start by repeatedly adding the cheapest edge that reaches a new node. It connects all nodes cheaply; it does not find shortest paths (that is Dijkstra).","Priority queue of crossing edges","Connects everything at minimum total weight.","Needs an undirected graph; covers only the start’s component.","O(E log V)","O(V+E)","Spans the start’s component","Yes: minimum total weight","Cable and pipe layout, clustering, circuit design"],
minimax:["Minimax","Adversarial","tree","Both players play perfectly. MAX picks the largest child value, MIN the smallest; leaf utilities flow up to the root.","Recursion (call stack)","Optimal play against a perfect opponent.","Visits every leaf: exponential.","O(b^d)","O(b·d)","Yes, on finite game trees","Yes, against an optimal opponent","Chess, checkers, tic-tac-toe engines"],
alphabeta:["Alpha-Beta Pruning","Adversarial","tree","Minimax plus bounds: α is MAX’s best guaranteed value, β is MIN’s. When α ≥ β the remaining children cannot change the decision, so they are pruned.","Recursion carrying α and β","Same answer as minimax, usually far fewer nodes.","Savings depend on move ordering.","O(b^d) worst, O(b^(d/2)) best","O(b·d)","Yes","Yes: same value as minimax","Game engines such as chess programs"],
stochastic:["Stochastic Search","Uncertainty","graph","Actions have random outcomes. The agent aims for the neighbour with the lowest w+h, but with probability p it slips to a random neighbour. Run it repeatedly to see different outcomes.","Current state, path, random draws","Models noisy real-world moves.","Results vary; no guarantee within the step limit.","Varies per run","O(path length)","Not guaranteed (step limit)","No","Noisy robot motion, randomized search, Monte-Carlo methods"],
pomdp:["Partially Observable Search (POMDP)","Uncertainty","pomdp","The agent can’t see the true state. It keeps a belief (a probability over states) and updates it with Bayes’ rule after each observation. Demo: the Tiger problem.","Belief state vector","Handles hidden information rationally.","Exact solving is very expensive.","PSPACE-hard (exact)","O(|S|) per belief update","Depends on the policy","Needs a planner; this demo uses a threshold policy","Robot navigation, medical decisions, dialogue systems"]};
const GR=[["Uninformed",["bfs","dfs"]],["Informed",["greedy","astar"]],["Graph optimization",["dijkstra","prim"]],["Adversarial",["minimax","alphabeta"]],["Uncertainty",["stochastic","pomdp"]]];
// ---------- graph model
let G,S,T,TR,TV=[3,5,6,9,1,2,0,-1];
const nm=id=>G.n.find(n=>n.id==id),H=id=>nm(id).h,ek=(a,b)=>[a,b].sort().join("-");
function demo(){G={n:[["A",70,250,9],["B",210,110,8],["C",210,390,6],["D",370,60,4],["E",370,250,5],["F",370,440,3],["G",560,150,2],["H",730,250,0]].map(([id,x,y,h])=>({id,x,y,h})),e:[["A","B",2],["A","C",5],["B","D",4],["B","E",7],["C","E",2],["C","F",6],["D","G",3],["E","G",4],["E","H",9],["F","H",3],["G","H",2]].map(([a,b,w])=>({a,b,w}))};S="A";T="H"}
const adj=()=>{const m={};G.n.forEach(n=>m[n.id]=[]);G.e.forEach(({a,b,w})=>{if(m[a]&&m[b]){m[a].push({v:b,w});m[b].push({v:a,w})}});for(const k in m)m[k].sort((p,q)=>p.v<q.v?-1:1);return m};
const rnd=n=>Math.floor(Math.random()*n);
function autoH(){const M=adj(),d={[T]:0},Q=[T];while(Q.length){Q.sort((a,b)=>d[a]-d[b]);const u=Q.shift();M[u].forEach(({v,w})=>{if(d[v]===undefined||d[u]+w<d[v]){d[v]=d[u]+w;Q.push(v)}})}G.n.forEach(n=>n.h=n.id==T?0:Math.max(0,(d[n.id]||0)-rnd(2)))}
function randG(){G={n:[],e:[]};for(let i=0;i<8;i++)G.n.push({id:"ABCDEFGH"[i],x:90+(i>>1)*200+rnd(60)-30,y:130+(i&1)*240+rnd(100)-50,h:0});for(let i=1;i<8;i++)G.e.push({a:G.n[rnd(i)].id,b:G.n[i].id,w:1+rnd(9)});for(let k=0;k<5;k++){const a=rnd(8),b=rnd(8);if(a!=b&&!G.e.some(e=>ek(e.a,e.b)==ek(G.n[a].id,G.n[b].id)))G.e.push({a:G.n[a].id,b:G.n[b].id,w:1+rnd(9)})}S="A";T="H";autoH()}
function buildTree(){TR=[];(function mk(d){const i=TR.length,n={i,d,id:String.fromCharCode(65+i),ch:[],max:d%2==0};TR.push(n);if(d<3)for(let k=0;k<2;k++)n.ch.push(mk(d+1));return i})(0);let L=0;(function ly(i){const n=TR[i];n.y=55+n.d*130;if(!n.ch.length){n.li=L;n.x=70+L*94;n.v=TV[L++]}else{n.ch.forEach(ly);n.x=(TR[n.ch[0]].x+TR[n.ch[1]].x)/2}})(0)}
// ---------- algorithms (generators yield real execution snapshots)
function* gAlgo(k){
 const M=adj(),g={[S]:0},par={};let F=[S],cl=new Set(),disc=new Set([S]),exp=0,mx=1,popped=null,added=[];
 const key=n=>k=="greedy"?H(n):k=="astar"?g[n]+H(n):g[n];
 const lab=()=>{const o={};disc.forEach(n=>o[n]=k=="astar"?`g${g[n]} h${H(n)} f${g[n]+H(n)}`:k=="greedy"?"h="+H(n):k=="dijkstra"?"d="+g[n]:"");return o};
 const ds=()=>k=="bfs"?"Queue, front first: ["+F.join(", ")+"]":k=="dfs"?"Stack, top on the right: ["+F.join(", ")+"]":"Priority queue, best first: "+(F.length?[...F].sort((a,b)=>key(a)-key(b)).map(n=>`${n}(${key(n)})`).join(", "):"empty");
 const st=()=>({"Expanded":exp,"Discovered":disc.size,"Max frontier":mx});
 const bq=k=="bfs"||k=="dfs";const sn=(cur,msg,x={})=>({cur,fr:[...new Set(F)],vis:[...cl],lab:lab(),msg,q:{k,it:(bq?[...F]:[...F].sort((a,b)=>key(a)-key(b))).map(n=>[n,bq?"":key(n)]),pop:popped,push:added},ds:ds(),st:st(),...x});
 const path=()=>{if(!(T in par)&&T!=S)return null;let p=[],n=T;while(n!=null){p.unshift(n);n=par[n]}return p};
 const rule=k=="bfs"?"oldest in the queue":k=="dfs"?"top of the stack":k=="greedy"?"smallest h":k=="astar"?"smallest f = g + h":"smallest distance";
 yield sn(null,`Start: ${S} enters the frontier.`);
 while(F.length){
  const i=k=="bfs"?0:k=="dfs"?F.length-1:F.reduce((b,n,j)=>key(n)<key(F[b])?j:b,0);
  const u=F.splice(i,1)[0];if(cl.has(u))continue;cl.add(u);exp++;popped=u;added=[];
  if(u==T&&k!="dijkstra"){const p=path();yield sn(u,`Goal ${T} reached. Path ${p.join(" → ")}, cost ${g[T]}.`,{path:p,done:1,cost:g[T],st:{...st(),"Path cost":g[T]}});return}
  yield sn(u,`Expand ${u}: ${rule}.`);
  const notes=[],n0=F.length;
  for(const {v,w} of (k=="dfs"?[...M[u]].reverse():M[u])){const ng=g[u]+w;
   if(k=="bfs"||k=="greedy"){if(!disc.has(v)){disc.add(v);g[v]=ng;par[v]=u;F.push(v);notes.push(v)}}
   else if(k=="dfs"){if(!cl.has(v)){disc.add(v);g[v]=ng;par[v]=u;F.push(v);notes.push(v)}}
   else if(g[v]===undefined||ng<g[v]){notes.push(`${v} (${g[v]===undefined?"":g[v]+" → "}${ng})`);g[v]=ng;par[v]=u;disc.add(v);cl.delete(v);if(!F.includes(v))F.push(v)}}
  added=F.slice(n0);mx=Math.max(mx,F.length);
  yield sn(u,notes.length?`From ${u}: ${k=="astar"||k=="dijkstra"?"relaxed/added":"added"} ${notes.join(", ")}.`:`${u} has nothing new to add${k=="dfs"?": backtrack":""}.`)}
 if(k=="dijkstra"){const p=path();yield sn(null,p?`All reachable nodes settled. Shortest ${S}→${T}: ${p.join(" → ")}, cost ${g[T]}.`:"Settled everything reachable; goal unreachable.",{path:p,done:1,cost:p?g[T]:undefined,st:{...st(),"Path cost":p?g[T]:"–"}})}
 else yield sn(null,"Frontier is empty: no path to the goal.",{done:1})}
function* prim(){
 const M=adj();let tr=new Set([S]),sel=[],w=0,cur=S;
 const cands=()=>{const c=[];tr.forEach(u=>M[u].forEach(({v,w})=>{if(!tr.has(v))c.push({u,v,w})}));return c.sort((a,b)=>a.w-b.w)};
 const sn=(msg,x={})=>{const c=cands();return{cur,fr:[],vis:[...tr],sel:sel.map(e=>ek(e.u,e.v)),cand:c.map(e=>ek(e.u,e.v)),lab:{},msg,q:{k:"pq",it:c.map(e=>[e.u+"–"+e.v,e.w]),pop:null,push:[]},ds:"Candidate edges, cheapest first: "+(c.map(e=>`${e.u}–${e.v}(${e.w})`).join(", ")||"none"),st:{"Tree nodes":tr.size,"Edges chosen":sel.length,"Total weight":w},...x}};
 yield sn(`Start the tree at ${S}. Dashed amber edges are the candidates.`);
 for(;;){const c=cands();if(!c.length)break;const e=c[0];tr.add(e.v);sel.push(e);w+=e.w;cur=e.v;yield sn(`Cheapest edge leaving the tree: ${e.u}–${e.v} (${e.w}). Add ${e.v}. Total ${w}.`)}
 yield sn(`Done: ${sel.length} edges, total weight ${w}${tr.size<G.n.length?" (graph is disconnected; this spans the start’s component)":""}.`,{done:1,cur:null,cost:w})}
function* mmAlgo(ab){
 const val={},al={},pr=new Set(),stk=[];let leaves=0,exp=0;
 const kids=i=>{const o=[],s=[...TR[i].ch];while(s.length){const c=s.pop();o.push(c);s.push(...TR[c].ch)}return o};
 const sn=(cur,msg,x={})=>({cur,val:{...val},ab:{...al},pr:[...pr],msg,q:{k:"dfs",it:stk.map(i=>[TR[i].id,""]),pop:null,push:[]},ds:"Call stack: "+(stk.map(i=>TR[i].id).join(" › ")||"empty"),st:{"Nodes visited":exp,"Leaves evaluated":leaves,"Pruned nodes":pr.size},...x});
 function* mm(i,a,b){const n=TR[i];stk.push(i);exp++;if(ab)al[i]=[a,b];
  if(!n.ch.length){leaves++;val[i]=n.v;yield sn(i,`Leaf ${n.id}: utility ${n.v}.`);stk.pop();return n.v}
  yield sn(i,`Visit ${n.id} (${n.max?"MAX":"MIN"}).${ab?` Bounds α=${f(a)}, β=${f(b)}.`:""}`);
  let best=n.max?-INF:INF;
  for(let j=0;j<n.ch.length;j++){const c=n.ch[j],v=yield* mm(c,a,b);
   if(n.max){best=Math.max(best,v);if(ab)a=Math.max(a,best)}else{best=Math.min(best,v);if(ab)b=Math.min(b,best)}
   val[i]=best;if(ab)al[i]=[a,b];
   yield sn(i,`${n.id} (${n.max?"MAX takes the larger":"MIN takes the smaller"}): best so far ${best} after child ${TR[c].id}=${v}.${ab?` α=${f(a)}, β=${f(b)}.`:""}`);
   if(ab&&a>=b&&j<n.ch.length-1){n.ch.slice(j+1).forEach(s=>{pr.add(s);kids(s).forEach(x=>pr.add(x))});
    yield sn(i,`Prune: α=${f(a)} ≥ β=${f(b)}. ${n.max?`MIN above already has an option ≤ ${f(b)}, and this MAX node is already ≥ ${f(a)}`:`MAX above already has an option ≥ ${f(a)}, and this MIN node is already ≤ ${f(b)}`}, so it will never be chosen. The rest of ${n.id}’s children are skipped.`);break}}
  stk.pop();return best}
 const r=yield* mm(0,-INF,INF);
 const mv=TR[0].ch.find(c=>!pr.has(c)&&val[c]==r);
 yield sn(0,`Root value = ${r}. MAX should move toward ${TR[mv!=null?mv:TR[0].ch[0]].id}.`,{done:1,cost:r})}
let SLIP=.3,SL=[];
function* stoch(){
 const M=adj(),p=SLIP;let u=S,path=[S],cost=0,t=0;
 const sn=(msg,x={})=>({cur:u,vis:[...path],path:[...path],fr:[],lab:{},msg,ds:`Slip probability p=${p}. Past runs (✓ steps / ✗): ${SL.map(r=>r.ok?"✓"+r.t:"✗").join(" ")||"none"}`,st:{"Run":SL.length+1,"Steps":t,"Cost":cost},...x});
 yield sn(`Run ${SL.length+1}: start at ${S}. Intended move = neighbour with lowest w+h.`);
 while(u!=T&&t<40){const ns=M[u];if(!ns.length)break;
  const it=ns.reduce((b,x)=>x.w+H(x.v)<b.w+H(b.v)?x:b),lab={};
  ns.forEach(x=>lab[x.v]="P="+((x==it?1-p:0)+p/ns.length).toFixed(2));
  yield sn(`At ${u}: aim for ${it.v}. Probability of landing on each neighbour is shown under it.`,{lab});
  const slip=Math.random()<p,ch=slip?ns[rnd(ns.length)]:it,from=u;t++;cost+=ch.w;u=ch.v;path.push(u);
  yield sn(`Random draw: ${slip?"slip, uniform random neighbour":"no slip"}. Moved ${from} → ${u} (+${ch.w}).`)}
 SL.push({ok:u==T,t});
 yield sn(u==T?`Reached ${T} in ${t} steps, cost ${cost}. Press Replay for another random run.`:`Stopped after ${t} steps without reaching ${T}.`,{done:1,cost})}
function* pomdp(){
 const tiger=Math.random()<.5?"L":"R",ACC=.85;let b=.5,tot=0,t=0;
 const P=(msg,x={})=>({pom:{tiger,b,tot,...x},msg,ds:`Belief: P(tiger left)=${b.toFixed(3)}, P(tiger right)=${(1-b).toFixed(3)}`,st:{"Steps":t,"Reward":tot},...(x.done?{done:1,cost:tot}:{})});
 yield P("The tiger is behind one door. The agent can’t see it, so its belief starts at 50/50. Actions: listen (−1), open left, open right (safe +10, tiger −100).");
 for(t=1;t<=15;t++){
  const act=b>=.95?"open right":b<=.05?"open left":"listen";
  yield P(`Policy: belief P(left)=${b.toFixed(2)}, so the agent chooses “${act}”.`,{act});
  if(act=="listen"){const heard=Math.random()<ACC?tiger:(tiger=="L"?"R":"L"),pl=heard=="L"?ACC:1-ACC,pr=heard=="L"?1-ACC:ACC,nb=pl*b/(pl*b+pr*(1-b));tot--;
   const m=`Heard growl on the ${heard=="L"?"left":"right"}. Bayes: b′(L) = ${pl}×${b.toFixed(3)} / (${pl}×${b.toFixed(3)} + ${pr}×${(1-b).toFixed(3)}) = ${nb.toFixed(3)}. Cost −1.`;b=nb;yield P(m,{act,obs:heard})}
  else{const door=act=="open left"?"L":"R",r=door==tiger?-100:10;tot+=r;yield P(`Opened the ${door=="L"?"left":"right"} door: ${r>0?"safe, +10":"the tiger! −100"}. Total reward ${tot}.`,{act,open:door,done:1});return}}
 yield P("Step limit reached.",{done:1})}
const mk=k=>k=="prim"?prim():k=="stochastic"?stoch():k=="minimax"?mmAlgo(0):k=="alphabeta"?mmAlgo(1):k=="pomdp"?pomdp():gAlgo(k);
// ---------- drawing
function draw(svg,s,mode,hh){svg.innerHTML=mode=="pomdp"?dPom(s):mode=="tree"?dTree(s):dGraph(s,hh)}
function dGraph(s,hh){s=s||{};const pp=s.path||[],pe=new Set(),sel=new Set(s.sel||[]),cd=new Set(s.cand||[]);let o="";
 if(window.BG)o+=`<image href="${window.BG}" x="0" y="0" width="800" height="500" opacity=".4" preserveAspectRatio="xMidYMid meet"/>`;for(let i=0;i<pp.length-1;i++)pe.add(ek(pp[i],pp[i+1]));
 G.e.forEach(e=>{const a=nm(e.a),b=nm(e.b);if(!a||!b)return;const k=ek(e.a,e.b),c=pe.has(k)?"ok":sel.has(k)?"sel":cd.has(k)?"cand":"",p=`x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"`;
  o+=`<g data-e="${k}"><line class="ed ${c}" ${p}/><line class="hit" ${p}/><text class="w" x="${(a.x+b.x)/2}" y="${(a.y+b.y)/2}">${e.w}</text></g>`});
 G.n.forEach(n=>{const c=s.cur==n.id?"cur":pp.includes(n.id)?"ok":(s.fr||[]).includes(n.id)?"fr":(s.vis||[]).includes(n.id)?"vis":"",sub=s.lab&&s.lab[n.id]!=null?s.lab[n.id]:hh?"h="+n.h:"";
  o+=`<g class="nd ${c}" data-n="${n.id}" transform="translate(${n.x},${n.y})">${n.id==S?'<circle class="ring" r="29"/>':""}${n.id==T&&K!="prim"&&K!="stochastic"||n.id==T&&K=="stochastic"?'<circle class="ring g" r="33"/>':""}<circle class="sh" r="22"/><text class="id">${n.id}</text><text class="sub" y="38">${sub}</text><text class="tag" y="-38">${n.id==S?"start":n.id==T&&K!="prim"?"goal":""}</text></g>`});
 return o}
function dTree(s){s=s||{};const v=s.val||{},pr=new Set(s.pr||[]);let o="";
 ["MAX","MIN","MAX","Leaves"].forEach((t,d)=>o+=`<text class="lv" x="8" y="${59+d*130}">${t}</text>`);
 TR.forEach(n=>n.ch.forEach(c=>{const m=TR[c];o+=`<line class="ed ${pr.has(c)?"pr":""}" x1="${n.x}" y1="${n.y}" x2="${m.x}" y2="${m.y}"/>`}));
 TR.forEach(n=>{const x=n.x,y=n.y,c=pr.has(n.i)?"pr":s.cur==n.i?"cur":v[n.i]!==undefined?"vis":"",ab=s.ab&&s.ab[n.i],
  sh=!n.ch.length?`<rect class="sh" x="-22" y="-20" width="44" height="40" rx="4"/>`:n.max?`<polygon class="sh" points="0,-26 -26,20 26,20"/>`:`<polygon class="sh" points="-26,-20 26,-20 0,26"/>`;
  o+=`<g class="nd ${c}" data-n="${n.i}" transform="translate(${x},${y})">${sh}<text class="id" y="${n.ch.length?(n.max?6:-4):0}">${!n.ch.length?n.v:v[n.i]!==undefined?v[n.i]:"?"}</text><text class="tag" y="-36">${n.id}</text><text class="sub" y="42">${ab?`α${f(ab[0])} β${f(ab[1])}`:""}</text></g>`});
 return o}
function dPom(s){const p=(s&&s.pom)||{tiger:"?",b:.5,tot:0},bar=(y,l,q)=>`<text class="lv" x="440" y="${y}">${l}</text><rect x="440" y="${y+8}" width="320" height="22" rx="4" fill="var(--nd)"/><rect x="440" y="${y+8}" width="${320*q}" height="22" rx="4" fill="var(--fr)"/><text class="w" x="${440+Math.max(320*q,30)-16}" y="${y+23}" style="stroke:none;fill:#fff">${q.toFixed(2)}</text>`;
 const door=(x,sd)=>`<text class="lv" x="${x+55}" y="150" text-anchor="middle">${sd=="L"?"Left":"Right"} door</text><rect class="door ${p.open==sd?"open":""}" x="${x}" y="165" width="110" height="170" rx="8"/><text class="big" x="${x+55}" y="262" text-anchor="middle">${p.tiger==sd?"🐯":"🚪"}</text>`;
 return `<rect x="20" y="20" width="380" height="460" rx="10" fill="none" stroke="var(--mut)" stroke-dasharray="6 5"/><text class="lv" x="36" y="50">Actual state (hidden from the agent)</text>${door(50,"L")}${door(240,"R")}<text class="lv" x="36" y="440">Tiger is behind the ${p.tiger=="L"?"left":p.tiger=="R"?"right":"?"} door.</text>
 <rect x="420" y="20" width="360" height="460" rx="10" fill="none" stroke="var(--fr)"/><text class="lv" x="440" y="50">What the agent knows: its belief</text>${bar(70,"P(tiger left)",p.b)}${bar(125,"P(tiger right)",1-p.b)}
 <text class="lv" x="440" y="215">Last action: ${p.act||"none yet"}</text><text class="lv" x="440" y="240">Last observation: ${p.obs?"growl "+(p.obs=="L"?"left":"right"):"none yet"}</text><text class="lv" x="440" y="265">Total reward: ${p.tot}</text>
 <text class="lv" x="440" y="310">Model</text><text class="lv" x="440" y="335" font-weight="400">Transition (listen): state stays the same</text><text class="lv" x="440" y="357" font-weight="400">Transition (open): tiger is re-hidden at random</text><text class="lv" x="440" y="379" font-weight="400">Observation: correct side w.p. 0.85, wrong 0.15</text><text class="lv" x="440" y="401" font-weight="400">Reward: listen −1, safe +10, tiger −100</text>`}
// ---------- engine
let V="viz",K="astar",MODE="graph",TOOL="move",hist=[],ix=-1,gen=null,timer=null,playing=false,delay=700,pend=null,drag=null,ca="bfs",cb="astar",Q=null,LV="Beginner";
const fin=()=>ix>=0&&ix==hist.length-1&&hist[ix].done;
function reset(clear){clearTimeout(timer);playing=false;hist=[];ix=-1;gen=null;pend=null;if(clear)SL=[];show()}
function adv(){if(ix<hist.length-1){ix++;show();return true}if(fin())return false;gen=gen||mk(K);const r=gen.next();if(r.done)return false;hist.push(r.value);ix++;show();return !r.value.done}
function loop(){if(!playing)return;if(adv())timer=setTimeout(loop,delay);else{playing=false;show()}}
function play(){if(playing){playing=false;clearTimeout(timer);show();return}if(fin()){if(K=="stochastic"||K=="pomdp"){hist=[];ix=-1;gen=null}else ix=-1}playing=true;show();loop()}
function show(){if(V!="viz"||!$("#cv"))return;const s=hist[ix]||null;
 draw($("#cv"),s,MODE,K=="greedy"||K=="astar"||K=="stochastic"||TOOL[0]=="h");
 $("#msg").textContent=s?s.msg:"Press Play for automatic mode, or Next for step-by-step mode. Every step is computed live by the algorithm.";
 $("#ds").textContent=s?s.ds:"";$("#qv").innerHTML=qviz(s&&s.q);$("#stt").innerHTML=Object.entries(s?s.st:{}).map(([k,v])=>`<div class="chip"><b>${v}</b>${k}</div>`).join("")||'<span class="mut">No statistics yet.</span>';
 $("#pp").textContent=playing?"Pause":fin()?"Replay":ix>=0?"Resume":"Start";$("#prev").disabled=ix<=0}
// ---------- views
function side(){$("#side").innerHTML=`<div class="brand">🧭 AlgoScope</div><div class="mut" style="padding:0 8px 6px;font-size:12px">AI search algorithms, visualized</div>`+GR.map(([g,l])=>`<div class="grp">${g}</div>`+l.map(k=>`<button class="nav ${V=="viz"&&K==k?"on":""}" data-k="${k}">${A[k][0]}</button>`).join("")).join("")+`<div class="grp">Compare and practise</div><button class="nav ${V=="cmp"?"on":""}" data-v="cmp">Compare algorithms</button><button class="nav ${V=="prac"?"on":""}" data-v="prac">Practice and quiz</button><div class="grp">Display</div><button class="nav" id="th">Switch light/dark</button><div class="mut" style="padding:18px 8px 0;font-size:12px">Developed by <b>Akash Kumar</b><br>AI Search Algorithms Project</div>`}
const TL={graph:[["move","Move"],["node","Add node"],["edge","Connect"],["del","Delete"],["start","Set start"],["goal","Set goal"],["w+","Weight +"],["w−","Weight −"],["h+","h +"],["h−","h −"]],tree:[["l+","Leaf +"],["l−","Leaf −"]]};
const HINT={move:"Drag nodes to reposition them.",node:"Click empty canvas to add a node.",edge:"Click two nodes to connect them (random weight).",del:"Click a node or an edge to remove it.",start:"Click a node to make it the start.",goal:"Click a node to make it the goal.","w+":"Click an edge to raise its weight.","w−":"Click an edge to lower its weight.","h+":"Click a node to raise its heuristic h.","h−":"Click a node to lower its heuristic h.","l+":"Click a leaf to raise its utility.","l−":"Click a leaf to lower its utility."};
function info(){const a=A[K],L=["Category","Definition and how it works","Data structure","Advantages","Disadvantages","Time complexity","Space complexity","Complete?","Optimal?","Real-world uses"];return `<dl>${L.map((l,i)=>`<dt>${l}</dt><dd>${[a[1],...a.slice(3)][i]}</dd>`).join("")}</dl>`}
function viz(){const m=MODE;$("#main").innerHTML=`<div class="ws"><section><h1>${A[K][0]}</h1><div class="mut">${A[K][1]} search. ${m=="graph"?"Edit the graph, then run it.":m=="tree"?"Edit the leaf utilities, then run it.":"The environment is hidden from the agent."}</div>
 <div class="row" id="tools">${(TL[m]||[]).map(([t,l])=>`<button class="b ${TOOL==t?"on":""}" data-t="${t}">${l}</button>`).join("")}${m=="graph"?'<button class="b" id="rg">Random graph</button><button class="b" id="ex">Load example</button><button class="b" id="ah">Auto h</button><button class="b" id="io">Import / export graph</button>':""}${m=="tree"?'<button class="b" id="rt">Random leaves</button><button class="b" id="ex">Load example</button>':""}</div>
 <div class="mut" id="hint">${HINT[TOOL]||""}</div>${m=="graph"?'<div class="card" id="iop" hidden><div class="mut">One item per line: <b>A B 4</b> is an edge A–B with weight 4; <b>h A 9</b> sets a heuristic; <b>pos A 100 200</b> sets a position (optional: nodes are placed on a circle otherwise); <b>start A</b>; <b>goal H</b>. Lines starting with # are ignored.</div><textarea id="tx" rows="8" spellcheck="false"></textarea><div class="row"><button class="b pri" id="ld">Load this graph</button></div></div>':""}
 <div class="card" style="margin-top:8px"><svg id="cv" viewBox="0 0 800 500" role="img" aria-label="Visualization canvas"></svg></div>
 <div class="row"><button class="b" id="rs">Reset</button><button class="b" id="prev">◀ Previous</button><button class="b pri" id="pp">Start</button><button class="b" id="nx">Next ▶</button><button class="b" id="rpt">Generate report</button><label class="mut">Speed <input type="range" id="sp" min="1" max="15" value="${Math.round((1600-delay)/100)}"></label>${K=="stochastic"?`<label class="mut">Slip p <input type="range" id="sl" min="0" max="9" value="${SLIP*10}"> <span id="slv">${SLIP}</span></label>`:""}</div></section>
 <section><div class="card"><h2>What just happened</h2><div id="msg"></div></div><div class="card"><h2>Data structure</h2><div id="qv"></div><div class="mono" id="ds"></div></div></section></div><details class="card"><summary><b>Statistics, colour legend and explanation</b></summary><h2 style="margin-top:10px">Live statistics</h2><div class="chips" id="stt" style="margin-bottom:10px"></div>
 <div class="card"><div class="lg"><span><i style="background:var(--nd);border:1px solid var(--ink)"></i>Unvisited</span><span><i style="background:var(--cur)"></i>Current</span><span><i style="background:var(--fr)"></i>Frontier</span><span><i style="background:var(--vis)"></i>Visited</span><span><i style="background:var(--ok)"></i>Path / goal</span><span><i style="border:1px dashed var(--bad)"></i>Pruned</span></div></div>
 <h2 style="margin-top:12px">About this algorithm</h2>${info()}</details>`;show()}
function drain(k){const g=mk(k);let last,n=0;for(let r=g.next();!r.done;r=g.next()){last=r.value;n++}return{last,n}}
const GA=["bfs","dfs","greedy","astar","dijkstra"];
function cmp(){const opts=s=>GA.map(k=>`<option value="${k}" ${k==s?"selected":""}>${A[k][0]}</option>`).join("");
 $("#main").innerHTML=`<h1>Compare algorithms</h1><div class="mut">Both run on the same graph, start, goal and heuristic (edit them in any graph algorithm’s view). Numbers come from real executions.</div><div class="row"><select id="ca">${opts(ca)}</select> vs <select id="cb">${opts(cb)}</select><button class="b pri" id="go">Run both</button></div><div id="out"></div>`;runCmp()}
function runCmp(){const ks=[ca,cb],opt=drain("dijkstra").last.cost,R=ks.map(k=>{const t0=performance.now();let r;for(let i=0;i<30;i++)r=drain(k);return{k,ms:(performance.now()-t0)/30,...r}});
 const row=(l,fn)=>`<tr><th>${l}</th>${R.map(r=>`<td>${fn(r)}</td>`).join("")}</tr>`,sv=(r,k)=>r.last.st[k]??"–",mxv=k=>Math.max(1,...R.map(r=>+sv(r,k)||0)),bars=k=>`<tr><th>${k}</th>${R.map((r,i)=>`<td><div class="bar ${i?"b2":""}" style="width:${(+sv(r,k)||0)/mxv(k)*100}%"></div>${sv(r,k)}</td>`).join("")}</tr>`;
 $("#out").innerHTML=`<div class="card"><table><tr><th></th>${R.map(r=>`<th>${A[r.k][0]}</th>`).join("")}</tr>
 ${row("Solution found",r=>r.last.path?"Yes":"No")}${row("Path",r=>r.last.path?r.last.path.join(" → "):"–")}${row("Path cost",r=>r.last.cost??"–")}${row("Optimal on this graph",r=>r.last.path?(r.last.cost==opt?"✓ yes":"✗ no (best is "+opt+")"):"–")}
 ${bars("Expanded")}${bars("Discovered")}${bars("Max frontier")}${row("Execution steps",r=>r.n)}${row("Avg run time",r=>r.ms.toFixed(3)+" ms")}${row("Complete (general)",r=>A[r.k][9])}${row("Optimal (general)",r=>A[r.k][10])}</table></div>
 <div class="cmp">${R.map((r,i)=>`<div class="card"><h2>${A[r.k][0]}: final state</h2><svg id="m${i}" viewBox="0 0 800 500"></svg></div>`).join("")}</div>`;
 R.forEach((r,i)=>{K=r.k;draw($("#m"+i),r.last,"graph",1)})}
// ---------- practice
const BANK={Beginner:[["Which data structure does BFS use?",["Stack","Queue","Priority queue","Hash set"],1,"BFS expands the oldest discovered node first: a FIFO queue."],["Which algorithm builds a minimum spanning tree?",["Dijkstra","A*","Prim","DFS"],2,"Prim adds the cheapest edge that reaches a new node. Dijkstra finds shortest paths instead."],["Which search may return a non-optimal path even with a heuristic?",["A* with admissible h","Dijkstra","Greedy best-first","BFS on unit weights"],2,"Greedy looks only at h(n) and ignores the cost so far."]],
Intermediate:[["In A*, f(n) equals…",["g(n)","h(n)","g(n) + h(n)","g(n) − h(n)"],2,"Cost so far plus estimated cost to go."],["Alpha-beta prunes a branch when…",["α ≥ β","α < β","a leaf is reached","the tree is full"],0,"Then the opponent would never allow play to reach this branch."],["Dijkstra’s algorithm breaks when the graph has…",["cycles","negative edge weights","many nodes","unit weights"],1,"It assumes a settled node can’t be improved later; negative edges violate that."]],
Advanced:[["A heuristic is admissible if it…",["never overestimates the true cost to the goal","is always zero","equals g(n)","is the same for all nodes"],0,"Admissibility makes A* optimal with tree search."],["Tiger POMDP: from belief 0.5, you hear a growl on the left (85% accurate). New P(tiger left)?",["0.50","0.85","0.15","0.95"],1,"0.85×0.5 / (0.85×0.5 + 0.15×0.5) = 0.85."],["Minimax on a tree with branching b and depth d evaluates up to…",["b·d leaves","b^d leaves","d^b leaves","2b leaves"],1,"Every leaf may be needed without pruning."]]};
const RULE={bfs:"BFS takes the oldest node in the queue.",dfs:"DFS takes the top of the stack, the most recently added node.",greedy:"Greedy takes the smallest h.",dijkstra:"Dijkstra takes the smallest distance d.",astar:"A* takes the smallest f = g + h."};
function newQ(){const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);let q=null;
 if(Math.random()<.5){const pool=LV=="Beginner"?["bfs","dfs"]:LV=="Intermediate"?["greedy","dijkstra","bfs"]:["astar","dijkstra","greedy"],k=pool[rnd(pool.length)],g=mk(k),S2=[];for(let r=g.next();!r.done;r=g.next())S2.push(r.value);
  const c=S2.map((s,i)=>i).filter(i=>S2[i].post!==0&&S2[i].fr&&S2[i].fr.length>=2&&S2[i+1]&&S2[i+1].cur&&S2[i+1].msg.startsWith("Expand"));
  if(c.length){const i=c[rnd(c.length)],s=S2[i],ans=S2[i+1].cur;q={k,s,p:`${A[k][0]}: which node is expanded next?`,o:sh(s.fr),a:ans,e:RULE[k]+` So ${ans} is next.`,show:k=="bfs"||k=="dfs"}}}
 if(!q&&LV=="Advanced"&&Math.random()<.5){const opt=drain("dijkstra").last.cost,o=[...new Set([opt,opt+1,opt+2,Math.max(1,opt-1)])];if(opt!=null)q={p:`Find the shortest path cost from ${S} to ${T} in the current graph.`,o:sh(o),a:opt,e:`Dijkstra settles nodes by distance; the shortest path costs ${opt}.`,g:1}}
 if(!q){const b=BANK[LV][rnd(3)];q={p:b[0],o:b[1],a:b[1][b[2]],e:b[3]}}return q}
function prac(){if(!Q)Q={q:newQ(),sc:0,n:0,done:0};const q=Q.q;
 $("#main").innerHTML=`<h1>Practice and quiz</h1><div class="row">${["Beginner","Intermediate","Advanced"].map(l=>`<button class="b ${LV==l?"on":""}" data-l="${l}">${l}</button>`).join("")}<span class="mut">Score ${Q.sc}/${Q.n}</span></div>
 <div class="card"><h2>${q.p}</h2>${q.s||q.g?'<svg id="qs" viewBox="0 0 800 500" style="max-width:640px"></svg>':""}${q.show?`<div class="mono">${q.s.ds}</div>`:""}
 ${q.o.map((o,i)=>`<button class="b opt ${Q.done?(o==q.a?"good":Q.pick==i?"wrong":""):""}" data-o="${i}">${o}</button>`).join("")}${Q.done?`<p><b>${Q.pick!=null&&q.o[Q.pick]==q.a?"Correct.":"Not quite."}</b> ${q.e}</p><button class="b pri" id="nq">Next question</button>`:""}</div>`;
 if(q.s){const kk=K;K=q.k;draw($("#qs"),{...q.s,cur:null},"graph",1);K=kk}else if(q.g){draw($("#qs"),null,"graph",0)}}
// ---------- wiring
function render(){side();V=="viz"?viz():V=="cmp"?cmp():prac()}
function setK(k){K=k;MODE=A[k][2];V="viz";TOOL=MODE=="tree"?"l+":"move";if(MODE=="tree")buildTree();reset();render()}
function chg(){reset();if(MODE=="tree")buildTree();show()}
const pt=ev=>{const c=$("#cv"),p=c.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;return p.matrixTransform(c.getScreenCTM().inverse())};
document.addEventListener("click",ev=>{const t=ev.target,b=t.closest("button");if(!b)return;
 if(b.dataset.k)return setK(b.dataset.k);if(b.dataset.v){V=b.dataset.v;Q=null;return render()}if(b.id=="th"){const d=document.documentElement,cur=d.dataset.theme||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");d.dataset.theme=cur=="dark"?"light":"dark";return}
 if(b.dataset.t){TOOL=b.dataset.t;pend=null;return viz()}
 if(b.dataset.l){LV=b.dataset.l;Q=null;return prac()}
 if(b.dataset.o!=null&&Q&&!Q.done){Q.pick=+b.dataset.o;Q.done=1;Q.n++;if(Q.q.o[Q.pick]==Q.q.a)Q.sc++;return prac()}
 if(b.id=="nq"){Q={q:newQ(),sc:Q.sc,n:Q.n,done:0};return prac()}
 ({rs:()=>reset(1),pp:play,nx:()=>{playing=false;clearTimeout(timer);if(fin()&&(K=="stochastic"||K=="pomdp")){hist=[];ix=-1;gen=null}adv();show()},prev:()=>{playing=false;clearTimeout(timer);if(ix>0){ix--;show()}},
 rg:()=>{randG();chg()},dl:dlRep,pr:()=>window.print(),rc:()=>$("#rep").remove(),rpt:report,io:()=>{const p=$("#iop");p.hidden=!p.hidden;$("#tx").value=expG()},ld:()=>parseG($("#tx").value),up:()=>$("#fi").click(),cp:()=>{window.BG="";show()},ex:()=>{MODE=="tree"?(TV=[3,5,6,9,1,2,0,-1]):demo();chg()},ah:()=>{autoH();chg()},rt:()=>{TV=TV.map(()=>rnd(19)-9);chg()},
 go:()=>{ca=$("#ca").value;cb=$("#cb").value;runCmp()}})[b.id]?.()});
document.addEventListener("input",ev=>{if(ev.target.id=="sp"){delay=1600-ev.target.value*100}if(ev.target.id=="sl"){SLIP=ev.target.value/10;$("#slv").textContent=SLIP;reset(1)}});
document.addEventListener("pointerdown",ev=>{if(!ev.target.closest("#cv")||V!="viz")return;const n=ev.target.closest("[data-n]"),e=ev.target.closest("[data-e]"),id=n&&n.dataset.n,sgn=TOOL.endsWith("−")?-1:1;
 if(MODE=="tree"){if(n&&TOOL[0]=="l"){const t=TR[+id];if(!t.ch.length){TV[t.li]=Math.max(-9,Math.min(99,TV[t.li]+sgn));chg()}}return}
 if(MODE!="graph")return;
 if(TOOL=="node"&&!n&&!e){const p=pt(ev);let i=0;while(G.n.some(x=>x.id=="N"+i))i++;const nid=G.n.length<26&&!G.n.some(x=>x.id==String.fromCharCode(65+G.n.length))?String.fromCharCode(65+G.n.length):"N"+i;G.n.push({id:nid,x:Math.round(p.x),y:Math.round(p.y),h:0});chg()}
 else if(TOOL=="move"&&n)drag=id;
 else if(TOOL=="edge"&&n){if(pend&&pend!=id){if(!G.e.some(x=>ek(x.a,x.b)==ek(pend,id)))G.e.push({a:pend,b:id,w:1+rnd(9)});pend=null;chg();$("#hint").textContent=HINT.edge}else{pend=id;$("#hint").textContent=`${id} selected: click a second node.`}}
 else if(TOOL=="del"){if(n&&G.n.length>2){G.n=G.n.filter(x=>x.id!=id);G.e=G.e.filter(x=>x.a!=id&&x.b!=id);if(S==id)S=G.n[0].id;if(T==id)T=G.n[G.n.length-1].id;chg()}else if(e){G.e=G.e.filter(x=>ek(x.a,x.b)!=e.dataset.e);chg()}}
 else if(TOOL=="start"&&n){S=id;chg()}else if(TOOL=="goal"&&n){T=id;chg()}
 else if(TOOL[0]=="w"&&e){const x=G.e.find(x=>ek(x.a,x.b)==e.dataset.e);x.w=Math.max(1,x.w+sgn);chg()}
 else if(TOOL[0]=="h"&&n){const x=nm(id);x.h=Math.max(0,x.h+sgn);chg()}});
document.addEventListener("pointermove",ev=>{if(!drag)return;const p=pt(ev),n=nm(drag);n.x=Math.max(30,Math.min(770,Math.round(p.x)));n.y=Math.max(40,Math.min(460,Math.round(p.y)));show()});
document.addEventListener("pointerup",()=>{drag=null});
let RB="";function CSSTXT(){try{return [...document.styleSheets].filter(x=>!x.href||x.href.includes("style.css")).map(x=>[...x.cssRules].map(r=>r.cssText).join("\n")).join("\n")}catch(e){return ""}}
async function dlRep(){const b=$("#dl");try{const d=await window.claude.use("downloads");if(!d){b.textContent="Download unavailable here: use Print";return}await d.save({filename:"AlgoScope-"+K+"-report.html",data:RB})}catch(e){if(!e||e.code!="declined")b.textContent="Download failed: use Print"}}
function report(){const g=mk(K),L2=[];for(let r=g.next();!r.done;r=g.next())L2.push(r.value);const L=L2[L2.length-1]||{st:{},msg:""},t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("viewBox","0 0 800 500");draw(t,L,MODE,K=="greedy"||K=="astar"||K=="stochastic");
 const el=document.createElement("div");el.id="rep";
 el.innerHTML=`<div class="rp"><div class="row noprint"><button class="b pri" id="dl">Download report</button><button class="b" id="pr">Print / save as PDF</button><button class="b" id="rc">Close report</button></div><h1>AlgoScope report: ${A[K][0]}</h1><p>Developed by Akash Kumar. Generated ${new Date().toLocaleString()}.</p><h2>Final state of the run</h2>${t.outerHTML}<h2>Result</h2><p>${L.msg}</p><div class="chips">${Object.entries(L.st||{}).map(([k,v])=>`<div class="chip"><b>${v}</b>${k}</div>`).join("")}</div><h2>Algorithm summary</h2>${info()}<h2>Step-by-step log (${L2.length} steps)</h2><ol>${L2.map(s=>`<li>${s.msg}</li>`).join("")}</ol></div>`;document.body.appendChild(el);el.scrollTop=0;const c=el.cloneNode(true);c.querySelector(".noprint").remove();RB=`<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><title>AlgoScope report</title><style>${CSSTXT()}body{background:#fff;color:#17212b;padding:20px}</style></head><body>${c.innerHTML}</body></html>`}
function qviz(q){if(!q)return"";const st=q.k=="dfs",ch=(a,c)=>`<div class="qi ${c||""}">${a[0]}${a[1]!==""?`<small>${a[1]}</small>`:""}</div>`,it=st?[...q.it].reverse():q.it;
 return `<div class="qv ${st?"stk":""}"><div class="qlab">${st?"Top of stack: push and pop happen here":q.k=="bfs"?"Front of queue: pop from here":"Best key first: pop from here"}</div><div class="qrow">${it.map(a=>ch(a,q.push.includes(a[0])?"new":"")).join("")||'<span class="mut">empty</span>'}</div>${!st&&q.k=="bfs"?'<div class="qlab">Back of queue: push at the end</div>':""}${q.pop?`<div class="qpop">Popped: ${ch([q.pop,""],"out")}</div>`:""}${q.push.length?`<div class="qpop">Pushed: ${q.push.map(n=>ch([n,""],"new")).join("")}</div>`:""}</div>`}
const expG=()=>[...G.e.map(e=>`${e.a} ${e.b} ${e.w}`),...G.n.map(n=>`h ${n.id} ${n.h}`),...G.n.map(n=>`pos ${n.id} ${n.x} ${n.y}`),`start ${S}`,`goal ${T}`].join("\n");
function parseG(t){const n={},E={};let s,g;const nd=id=>n[id]||(n[id]={id,x:0,y:0,h:0,p:0});
 for(const l of t.split("\n")){const w=l.trim().split(/[\s,]+/);if(!w[0]||w[0][0]=="#")continue;
  if(w[0]=="h"&&w.length==3)nd(w[1]).h=Math.max(0,+w[2]||0);else if(w[0]=="pos"&&w.length==4){const q=nd(w[1]);q.x=Math.max(30,Math.min(770,+w[2]||0));q.y=Math.max(40,Math.min(460,+w[3]||0));q.p=1}else if(w[0]=="start")s=w[1];else if(w[0]=="goal")g=w[1];
  else if(w.length>=2&&w[0]!=w[1]){nd(w[0]);nd(w[1]);E[ek(w[0],w[1])]={a:w[0],b:w[1],w:Math.max(1,+w[2]||1)}}}
 const ids=Object.keys(n);if(ids.length<2||ids.length>26){$("#hint").textContent="Use 2 to 26 nodes, with at least one edge such as: A B 4";return}
 ids.forEach((id,i)=>{const q=n[id];if(!q.p){const a=2*Math.PI*i/ids.length;q.x=Math.round(400+300*Math.cos(a));q.y=Math.round(250+190*Math.sin(a))}});
 G={n:ids.map(i=>n[i]),e:Object.values(E)};S=n[s]?s:ids[0];T=n[g]?g:ids[ids.length-1];chg();$("#hint").textContent=`Loaded ${ids.length} nodes and ${G.e.length} edges.`}
document.addEventListener("change",ev=>{if(ev.target.id=="fi"&&ev.target.files[0]){const r=new FileReader();r.onload=()=>{window.BG=r.result;show()};r.readAsDataURL(ev.target.files[0])}});
demo();buildTree();setK("astar");
