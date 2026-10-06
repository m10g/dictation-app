'use strict';

const SENTENCES = [
  {text:"It’s Joe’s first day at his new school.", chunks:["It’s Joe’s","first day","at his new school."]},
  {text:"It’s ten o’clock and the pupils are in the music room.", chunks:["It’s ten o’clock","and the pupils are","in the music room."]},
  {text:"They’re playing the recorder.", chunks:["They’re playing","the recorder."]},
  {text:"Joe thinks it is difficult to repeat after the teacher.", chunks:["Joe thinks it is difficult","to repeat","after the teacher."]},
  {text:"“Oh, no!” says Joe.", chunks:["“Oh, no!”","says Joe."]},
  {text:"“I’m in the wrong class.”", chunks:["“I’m in","the wrong class.”"]},
  {text:"Joe and the other pupils laugh.", chunks:["Joe and the other pupils","laugh."]},
  {text:"Joe goes to his classroom.", chunks:["Joe goes","to his classroom."]}
];

const SPELL_WORDS = [
  {word:"It’s",clue:"It is — remember the apostrophe"},
  {word:"Joe’s",clue:"Something belonging to Joe"},
  {word:"o’clock",clue:"The time word in sentence 2"},
  {word:"They’re",clue:"They are — remember the apostrophe"},
  {word:"recorder",clue:"The instrument in the music room"},
  {word:"difficult",clue:"Joe thinks it is ________"},
  {word:"repeat",clue:"Joe needs to ________ after the teacher"},
  {word:"classroom",clue:"Where Joe finally goes"}
];

const DETECTIVE = [
  ["It’s Joe’s first day at his new school.","Its Joe’s first day at his new school.","It’s joe’s first day at his new school."],
  ["It’s ten o’clock and the pupils are in the music room.","It’s ten oclock and the pupils are in the music room.","It’s ten o’clock and the pupils are in the music room"],
  ["They’re playing the recorder.","Theyre playing the recorder.","they’re playing the recorder."],
  ["Joe thinks it is difficult to repeat after the teacher.","Joe thinks it is difficult to repeat after the teacher","joe thinks it is difficult to repeat after the teacher."],
  ["“Oh, no!” says Joe.","“Oh no!” says Joe.","“Oh, no!” Says Joe."],
  ["“I’m in the wrong class.”","“Im in the wrong class.”","“I’m in the wrong class”"],
  ["Joe and the other pupils laugh.","Joe and the other pupils laugh","joe and the other pupils laugh."],
  ["Joe goes to his classroom.","Joe goes to his classroom","joe goes to his classroom."]
];

const PET_EMOJI={Pipo:"🐣",Mimi:"🐰",Toto:"🐭",Bibi:"🐸"};
const $=id=>document.getElementById(id);

let state={pet:"Pipo",color:"#ffe07a",stars:0,snacks:0,builderDone:[],spellDone:[],detectiveDone:[],bossDone:[],preview:6};
try{
  const saved=JSON.parse(localStorage.getItem("dictapetStateV2")||"null");
  if(saved) state={...state,...saved};
  else{
    const old=JSON.parse(localStorage.getItem("dictapetState")||"null");
    if(old) state={...state,pet:old.pet||state.pet,color:old.color||state.color,stars:old.stars||0,snacks:old.snacks||0};
  }
}catch(e){}

let activeView="home", timers=[], builder={i:0,round:"chunks",selected:[],order:[]}, spell={i:0,selected:[],order:[]}, detective={i:0,locked:false}, boss={i:0};

function save(){
  try{localStorage.setItem("dictapetStateV2",JSON.stringify(state))}catch(e){}
  sync();
}
function clearTimers(){timers.forEach(x=>{clearTimeout(x);clearInterval(x)});timers=[]}
function later(fn,ms){const t=setTimeout(fn,ms);timers.push(t);return t}
function sync(){
  $("stars").textContent=state.stars;$("snacks").textContent=state.snacks;
  document.querySelectorAll(".pet").forEach(p=>p.style.setProperty("--pet",state.color));
  document.querySelectorAll(".petbtn").forEach(b=>b.classList.toggle("sel",b.dataset.name===state.pet));
  ["builderJourneyPet","spellJourneyPet","detectiveJourneyPet","bossJourneyPet"].forEach(id=>{const el=$(id);if(el)el.textContent=PET_EMOJI[state.pet]||"🐣"});
}
function showView(id){
  clearTimers();
  if(id===activeView)return;
  const old=$(activeView),next=$(id);
  if(old){old.classList.remove("active");old.classList.add("leaving")}
  later(()=>{if(old)old.classList.remove("leaving");next.classList.add("active");activeView=id;window.scrollTo({top:0,behavior:"smooth"})},210);
}
document.querySelectorAll(".homeBtn").forEach(b=>b.onclick=()=>showView("home"));

function celebrate(petId,stars=1,snack=false){
  const pet=$(petId); if(pet){pet.classList.remove("celebrate");void pet.offsetWidth;pet.classList.add("celebrate")}
  const target=$("starPill").getBoundingClientRect();
  const source=(pet||document.body).getBoundingClientRect();
  const s=document.createElement("div");s.className="flystar";s.textContent="⭐";
  s.style.left=(source.left+source.width/2)+"px";s.style.top=(source.top+source.height/2)+"px";
  document.body.appendChild(s);
  requestAnimationFrame(()=>{s.style.transform=`translate(${target.left-source.left}px,${target.top-source.top}px) scale(.4)`;s.style.opacity=".2"});
  setTimeout(()=>{s.remove();$("starPill").classList.remove("bump");void $("starPill").offsetWidth;$("starPill").classList.add("bump")},760);
  if(snack){setTimeout(()=>{$("snackPill").classList.remove("bump");void $("snackPill").offsetWidth;$("snackPill").classList.add("bump")},900)}
  for(let k=0;k<6;k++){const c=document.createElement("div");c.className="confetti";c.textContent=["✨","⭐","🎉"][k%3];c.style.left=(source.left+source.width/2)+"px";c.style.top=(source.top+10)+"px";c.style.setProperty("--x",`${(Math.random()-.5)*180}px`);c.style.setProperty("--y",`${50+Math.random()*130}px`);document.body.appendChild(c);setTimeout(()=>c.remove(),1050)}
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function track(elId,current,done,total){
  const el=$(elId);el.innerHTML=Array.from({length:total},(_,n)=>`<div class="node ${done.includes(n)?"done":""} ${n===current?"now":""}">${n+1}</div>`).join("");
  setTimeout(()=>movePet(elId.replace("Track","JourneyPet"),elId,current),50)
}
function movePet(petId,trackId,current){
  const pet=$(petId),tr=$(trackId);if(!pet||!tr)return;
  const nodes=[...tr.querySelectorAll(".node")],node=nodes[Math.min(current,nodes.length-1)];if(!node)return;
  const r=node.getBoundingClientRect(),pr=pet.parentElement.getBoundingClientRect();
  pet.style.transform=`translate(${r.left-pr.left+r.width/2-14}px,${r.top-pr.top-23}px)`;
}
window.addEventListener("resize",()=>{["builder","spell","detective","boss"].forEach(m=>{const i=m==="builder"?builder.i:m==="spell"?spell.i:m==="detective"?detective.i:boss.i;movePet(m+"JourneyPet",m+"Track",i)})});

function animateSwap(cardId,fn){
  const c=$(cardId);c.classList.remove("swap");void c.offsetWidth;c.classList.add("swap");later(()=>fn(),205)
}

function startCountdown(memoryId,timerId,text,seconds,onDone){
  clearTimers();const mem=$(memoryId),bar=$(timerId);
  mem.className="memory";mem.textContent=text;bar.style.width="100%";
  const start=Date.now(),iv=setInterval(()=>{const left=Math.max(0,1-(Date.now()-start)/(seconds*1000));bar.style.width=(left*100)+"%";if(left<=0){clearInterval(iv);mem.classList.add("hiding");later(()=>{mem.className="memory hidden";mem.textContent="🙈 Hidden — now use your memory!";onDone()},560)}},80);timers.push(iv)
}

document.querySelectorAll(".petbtn").forEach(b=>b.onclick=()=>{state.pet=b.dataset.name;state.color=b.dataset.color;save();$("homeSpeech").textContent=`${state.pet} is ready! ✨`});
$("startBest").onclick=()=>startBuilder();
$("builderMode").onclick=()=>startBuilder();
$("spellMode").onclick=()=>startSpell();
$("detectiveMode").onclick=()=>startDetective();
$("bossMode").onclick=()=>startBoss();

function startBuilder(){builder={i:0,round:"chunks",selected:[],order:[]};showView("builder");later(loadBuilder,250)}
function loadBuilder(){
  const {i,round}=builder;track("builderTrack",i,state.builderDone,8);$("builderProgress").style.width=`${(i/8)*100}%`;
  $("builderTitle").textContent=`Sentence Builder • ${i+1} of 8`;
  $("builderRoundBadge").textContent=round==="chunks"?"Round 1 • Phrase tiles":"Round 2 • Word tiles";
  $("builderFeedback").className="feedback";$("builderPlay").style.display="none";
  builder.selected=[];builder.order=[];
  startCountdown("builderMemory","builderTimer",SENTENCES[i].text,state.preview,()=>renderBuilderTiles())
}
function builderItems(){
  if(builder.round==="chunks")return SENTENCES[builder.i].chunks;
  return SENTENCES[builder.i].text.split(" ");
}
function renderBuilderTiles(){
  const items=builderItems();builder.order=shuffle(items.map((text,id)=>({id,text})));
  $("builderPlay").style.display="block";renderBuilder();
  $("builderPrompt").textContent=builder.round==="chunks"?"Build it using the big phrase tiles":"Now build the exact sentence word by word";
  later(()=>$("builderPlay").scrollIntoView({behavior:"smooth",block:"center"}),100)
}
function renderBuilder(){
  const ans=$("builderAnswer");ans.innerHTML="";ans.classList.toggle("empty",builder.selected.length===0);
  builder.selected.forEach(id=>{const item=builder.order.find(x=>x.id===id);const b=document.createElement("button");b.className="tile answer"+(builder.round==="chunks"?" phrase":"");b.textContent=item.text;b.onclick=()=>{builder.selected=builder.selected.filter(x=>x!==id);renderBuilder()};ans.appendChild(b)});
  $("builderBank").innerHTML="";
  builder.order.forEach(item=>{const b=document.createElement("button");b.className="tile"+(builder.round==="chunks"?" phrase":"")+(builder.selected.includes(item.id)?" used":"");b.textContent=item.text;b.onclick=()=>{builder.selected.push(item.id);renderBuilder()};$("builderBank").appendChild(b)})
}
$("builderUndo").onclick=()=>{builder.selected.pop();renderBuilder()};
$("builderReplay").onclick=()=>loadBuilder();
$("builderCheck").onclick=()=>{
  const got=builder.selected.map(id=>builder.order.find(x=>x.id===id).text).join(" ");
  const target=builderItems().join(" ");
  const f=$("builderFeedback");
  if(got===target){
    f.className="feedback good show";f.innerHTML="<b>Perfect order! 🌟</b>";
    state.stars+=builder.round==="chunks"?1:2;if(builder.round==="words")state.snacks++;save();celebrate("builderJourneyPet",1,builder.round==="words");
    if(builder.round==="chunks"){
      later(()=>animateSwap("builderCard",()=>{builder.round="words";loadBuilder()}),850)
    }else{
      if(!state.builderDone.includes(builder.i))state.builderDone.push(builder.i);save();
      later(()=>{builder.i++;if(builder.i>=8){state.stars+=4;save();showView("home");later(()=>{$("homeSpeech").textContent="Builder complete! 🎓";celebrate("homePet",4,true)},300)}else animateSwap("builderCard",()=>{builder.round="chunks";loadBuilder()})},900)
    }
  }else{
    f.className="feedback try show";f.innerHTML="<b>Almost.</b> Tap a tile in your answer to put it back, then try again.";
  }
};

function startSpell(){spell={i:0,selected:[],order:[]};showView("spell");later(loadSpell,250)}
function loadSpell(){
  const w=SPELL_WORDS[spell.i];spell.selected=[];spell.order=[];
  track("spellTrack",spell.i,state.spellDone,8);$("spellProgress").style.width=`${(spell.i/8)*100}%`;
  $("spellBadge").textContent=`Word ${spell.i+1} of 8`;$("spellClue").textContent=w.clue;$("spellPlay").style.display="none";$("spellFeedback").className="feedback";
  startCountdown("spellPreview","spellTimer",w.word,4,()=>setupSpell())
}
function setupSpell(){
  const w=SPELL_WORDS[spell.i].word;
  spell.order=shuffle([...w].map((ch,id)=>({id,ch})));
  spell.selected=[];
  $("spellPlay").style.display="block";
  renderSpell();
  later(()=>$("spellPlay").scrollIntoView({behavior:"smooth",block:"center"}),80)
}
function spellBuilt(){return spell.selected.map(id=>spell.order.find(x=>x.id===id).ch).join("")}
function renderSpell(){
  const w=SPELL_WORDS[spell.i].word,built=spellBuilt();
  $("spellSlots").innerHTML=[...w].map((_,n)=>`<span class="letterSlot">${[...built][n]||""}</span>`).join("");
  $("spellBank").innerHTML="";
  spell.order.forEach(item=>{
    const b=document.createElement("button");b.className="tile letter"+(spell.selected.includes(item.id)?" used":"");b.textContent=item.ch;
    b.onclick=()=>{if(spell.selected.includes(item.id)||spell.selected.length>=[...w].length)return;spell.selected.push(item.id);renderSpell();if(spell.selected.length===[...w].length)checkSpell()};
    $("spellBank").appendChild(b)
  })
}
function checkSpell(){
  const w=SPELL_WORDS[spell.i].word,f=$("spellFeedback");
  if(spellBuilt()===w){
    f.className="feedback good show";f.innerHTML="<b>Spelled perfectly! 🔤✨</b> +2 ⭐";
    state.stars+=2;state.snacks++;if(!state.spellDone.includes(spell.i))state.spellDone.push(spell.i);save();celebrate("spellJourneyPet",2,true);
    later(()=>{spell.i++;if(spell.i>=SPELL_WORDS.length){showView("home");later(()=>{$("homeSpeech").textContent="Spelling Lab complete! 🧠";celebrate("homePet",2,true)},300)}else animateSwap("spellCard",loadSpell)},900)
  }else{
    f.className="feedback try show";f.innerHTML="<b>Good try.</b> Look at the word again, then rebuild it.";
    later(()=>{spell.selected=[];renderSpell()},700)
  }
}
$("spellBack").onclick=()=>{spell.selected.pop();renderSpell()};
$("spellPeek").onclick=()=>loadSpell();

function startDetective(){detective={i:0,locked:false};showView("detective");later(loadDetective,250)}
function loadDetective(){
  detective.locked=false;track("detectiveTrack",detective.i,state.detectiveDone,8);$("detectiveProgress").style.width=`${(detective.i/8)*100}%`;
  $("detectiveBadge").textContent=`Case ${detective.i+1} of 8`;$("detectiveFeedback").className="feedback";
  const options=shuffle(DETECTIVE[detective.i].map((text,idx)=>({text,correct:idx===0})));
  $("detectiveChoices").innerHTML="";
  options.forEach(o=>{const b=document.createElement("button");b.className="choice";b.textContent=o.text;b.onclick=()=>chooseDetective(b,o.correct);$("detectiveChoices").appendChild(b)})
}
function chooseDetective(btn,correct){
  if(detective.locked)return;const f=$("detectiveFeedback");
  if(correct){
    detective.locked=true;btn.classList.add("correct");f.className="feedback good show";f.innerHTML="<b>Case solved! 🔎✨</b> +2 ⭐";
    state.stars+=2;if(!state.detectiveDone.includes(detective.i))state.detectiveDone.push(detective.i);save();celebrate("detectiveJourneyPet",2,false);
    later(()=>{detective.i++;if(detective.i>=8){showView("home");later(()=>{$("homeSpeech").textContent="Detective mission complete! 🕵️";celebrate("homePet",2,true)},300)}else animateSwap("detectiveCard",loadDetective)},900)
  }else{
    btn.classList.add("wrong");f.className="feedback try show";f.innerHTML="<b>Something tiny is wrong.</b> Check capitals, apostrophes and punctuation.";
    later(()=>btn.classList.remove("wrong"),500)
  }
}

function startBoss(){boss={i:0};showView("boss");later(loadBoss,250)}
function loadBoss(){
  track("bossTrack",boss.i,state.bossDone,8);$("bossProgress").style.width=`${(boss.i/8)*100}%`;$("bossBadge").textContent=`Sentence ${boss.i+1} of 8`;
  $("bossPaper").style.display="none";$("bossRevealBox").className="reveal";$("bossSelfCheck").style.display="none";
  startCountdown("bossMemory","bossTimer",SENTENCES[boss.i].text,state.preview,()=>{$("bossPaper").style.display="block";later(()=>$("bossPaper").scrollIntoView({behavior:"smooth",block:"center"}),80)})
}
$("bossReveal").onclick=()=>{$("bossRevealBox").textContent=SENTENCES[boss.i].text;$("bossRevealBox").className="reveal show";$("bossSelfCheck").style.display="block";later(()=>$("bossSelfCheck").scrollIntoView({behavior:"smooth",block:"center"}),120)};
$("bossPerfect").onclick=()=>{
  state.stars+=3;state.snacks++;if(!state.bossDone.includes(boss.i))state.bossDone.push(boss.i);save();celebrate("bossJourneyPet",3,true);
  later(()=>{boss.i++;if(boss.i>=8){state.stars+=5;save();showView("home");later(()=>{$("homeSpeech").textContent="Boss Battle complete! Exam-ready! 🏆";celebrate("homePet",5,true)},300)}else animateSwap("bossCard",loadBoss)},900)
};
$("bossRetry").onclick=()=>animateSwap("bossCard",loadBoss);

sync();
