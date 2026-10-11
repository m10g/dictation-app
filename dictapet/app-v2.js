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

const VOCAB = [
  {word:"classroom",icon:"🏫",hint:"a room where pupils learn"},
  {word:"wrong",icon:"❌",hint:"not correct"},
  {word:"playground",icon:"🛝",hint:"where pupils play"},
  {word:"laugh",icon:"😂",hint:"what you do when something is funny"},
  {word:"computer studies",icon:"💻",hint:"a school subject using computers"},
  {word:"homework",icon:"📚",hint:"school work you do at home"},
  {word:"understand",icon:"💡",hint:"know what something means"},
  {word:"science",icon:"🔬",hint:"a school subject with experiments"},
  {word:"break time",icon:"🍎",hint:"time to rest at school"},
  {word:"different",icon:"🔀",hint:"not the same"},
  {word:"strange",icon:"👽",hint:"unusual or odd"},
  {word:"maths",icon:"➗",hint:"a school subject with numbers"}
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

let state={pet:"Pipo",color:"#ffe07a",stars:0,snacks:0,vocabDone:[],vocabTestHistory:[],partBTestHistory:[],builderDone:[],spellDone:[],detectiveDone:[],bossDone:[],preview:6};
try{
  const saved=JSON.parse(localStorage.getItem("dictapetStateV2")||"null");
  if(saved) state={...state,...saved};
  else{
    const old=JSON.parse(localStorage.getItem("dictapetState")||"null");
    if(old) state={...state,pet:old.pet||state.pet,color:old.color||state.color,stars:old.stars||0,snacks:old.snacks||0};
  }
}catch(e){}

let activeView="home", timers=[], vocab={i:0,selected:[],order:[],locked:false}, vocabTest={i:0,items:[],answer:"",results:[],locked:false}, partBTest={i:0,markI:0,marks:[],speaking:false}, builder={i:0,round:"chunks",selected:[],order:[]}, spell={i:0,selected:[],order:[]}, detective={i:0,locked:false}, boss={i:0};

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
  if($("partAHistorySummary"))renderVocabHistorySummary();
  if($("partBHistorySummary"))renderPartBHistorySummary();
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
$("startBest").onclick=()=>startVocab();
$("vocabMode").onclick=()=>startVocab();
$("vocabTestMode").onclick=()=>startVocabTest();
$("vocabHistoryMode").onclick=()=>showVocabHistory();
$("builderMode").onclick=()=>startBuilder();
$("spellMode").onclick=()=>startSpell();
$("detectiveMode").onclick=()=>startDetective();
$("bossMode").onclick=()=>startBoss();
$("partBTestMode").onclick=()=>startPartBTest();
$("partBHistoryMode").onclick=()=>showPartBHistory();



/* PART A TEST + SCORE HISTORY */
function formatTestDate(ts){
  try{return new Date(ts).toLocaleString([], {month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
  catch(e){return new Date(ts).toLocaleString()}
}
function recentHistory(){
  return Array.isArray(state.vocabTestHistory)?state.vocabTestHistory:[];
}
function testMeta(t){
  const total=t.total||((t.results||[]).length)||10;
  const maxScore=t.maxScore||(total*3);
  const score=Number(t.score||0);
  const pct=maxScore?Math.round((score/maxScore)*100):0;
  return {total:total,maxScore:maxScore,score:score,pct:pct};
}
function renderVocabHistorySummary(){
  const box=$("partAHistorySummary");if(!box)return;
  const h=recentHistory();
  if(!h.length){
    box.innerHTML='<div class="historyEmpty">No Part A test yet. Aaron’s scores will appear here after each test.</div>';
    return;
  }
  const latest=testMeta(h[0]);
  const last5=h.slice(0,5);
  const best=Math.max.apply(null,h.map(function(x){return testMeta(x).pct}));
  const avg=Math.round(last5.reduce(function(s,x){return s+testMeta(x).pct},0)/last5.length);
  const bars=last5.slice().reverse().map(function(x){
    const m=testMeta(x);
    return '<span class="trendBar" title="'+m.score+'/'+m.maxScore+' ('+m.pct+'%)"><i style="height:'+Math.max(8,m.pct)+'%"></i></span>';
  }).join("");
  box.innerHTML='<div class="historyStats">'+
    '<div><b>'+latest.score+'/'+latest.maxScore+'</b><small>Latest</small></div>'+
    '<div><b>'+best+'%</b><small>Best</small></div>'+
    '<div><b>'+avg+'%</b><small>Avg last '+last5.length+'</small></div>'+
    '</div><div class="trendWrap"><span>Recent</span><div class="trendBars">'+bars+'</div></div>';
}
function showVocabHistory(){
  renderVocabHistoryFull();
  showView("vocabHistory");
}
function renderVocabHistoryFull(){
  const h=recentHistory(),list=$("vocabHistoryList"),summary=$("vocabHistoryTop");
  if(!h.length){
    summary.innerHTML='<b>No tests yet.</b> Complete a Part A Test and the result will be saved automatically.';
    list.innerHTML="";
    return;
  }
  const best=Math.max.apply(null,h.map(function(x){return testMeta(x).pct}));
  const avg=Math.round(h.reduce(function(s,x){return s+testMeta(x).pct},0)/h.length);
  summary.innerHTML='<b>'+h.length+' test'+(h.length===1?'':'s')+'</b> • Best '+best+'% • Overall average '+avg+'%';
  list.innerHTML=h.map(function(t){
    const m=testMeta(t);
    const results=t.results||[];
    const missed=results.filter(function(r){return !r.correct}).map(function(r){return r.word});
    const answers=results.map(function(r,n){
      return '<div class="historyAnswerRow '+(r.correct?'correct':'wrong')+'">'+
        '<span class="historyAnswerNum">'+(n+1)+'</span>'+
        '<div><small>Aaron’s answer</small><b>'+(r.answer||'—')+'</b></div>'+
        '<div><small>Correct answer</small><b>'+r.word+'</b></div>'+
        '<span class="historyAnswerMark">'+(r.correct?'✅':'❌')+'</span>'+
      '</div>';
    }).join("");
    return '<div class="historyEntry">'+
      '<div class="historyRow">'+
        '<div class="historyScore '+(m.pct>=90?'great':m.pct>=70?'ok':'needs')+'">'+m.score+'<span>/'+m.maxScore+'</span></div>'+
        '<div class="historyDetails"><b>'+formatTestDate(t.ts)+'</b><small>'+t.correctCount+'/'+m.total+' exact • '+m.pct+'%</small>'+
        '<div class="missedWords">'+(missed.length?'Review: '+missed.join(', '):'Perfect — no words missed 🎉')+'</div></div>'+
      '</div>'+
      '<details class="historyAnswers"><summary>See Aaron’s answers and correct answers</summary>'+
        '<div class="historyAnswerList">'+(answers||'<div class="historyEmpty">Answer details were not saved for this older test.</div>')+'</div>'+
      '</details>'+
    '</div>';
  }).join("");
}
function speakVocabTestWord(){
  const item=VOCAB[vocabTest.items[vocabTest.i]];
  const status=$("vocabTestListenStatus");
  if(!item)return;
  if(!("speechSynthesis" in window)){
    status.textContent="Audio is not available on this browser.";
    return;
  }
  try{
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(item.word);
    u.lang="en-GB";u.rate=.78;u.pitch=1;
    u.onstart=function(){status.textContent="Listen carefully… 🔊"};
    u.onend=function(){status.textContent="Tap 🔊 Hear word if you want to hear it again."};
    u.onerror=function(){status.textContent="Tap 🔊 Hear word to try again."};
    window.speechSynthesis.speak(u);
  }catch(e){
    status.textContent="Tap 🔊 Hear word to try again.";
  }
}
function startVocabTest(){
  vocabTest={i:0,items:shuffle(VOCAB.map(function(_,i){return i})),answer:"",results:[],locked:false};
  showView("vocabTest");
  later(loadVocabTest,250);
}
function loadVocabTest(){
  vocabTest.answer="";vocabTest.locked=false;
  $("vocabTestBadge").textContent="Word "+(vocabTest.i+1)+" of 12";
  $("vocabTestProgress").style.width=((vocabTest.i/12)*100)+"%";
  $("vocabTestPrompt").innerHTML='<span class="testEar">🔊</span><b>Listen to the word</b><span class="tiny">Spell exactly what you hear.</span>';
  $("vocabTestListenStatus").textContent="Tap 🔊 Hear word if you want to hear it again.";
  $("vocabTestFeedback").className="feedback";
  renderAlphabetPad();
  renderVocabTestAnswer();
  later(speakVocabTestWord,220);
}
function renderAlphabetPad(){
  const pad=$("alphabetPad");pad.innerHTML="";
  "abcdefghijklmnopqrstuvwxyz".split("").forEach(function(ch){
    const b=document.createElement("button");b.className="alphaKey";b.textContent=ch;
    b.onclick=function(){if(vocabTest.locked)return;vocabTest.answer+=ch;renderVocabTestAnswer()};
    pad.appendChild(b);
  });
  const space=document.createElement("button");space.className="alphaKey wide";space.textContent="space";
  space.onclick=function(){
    if(vocabTest.locked||!vocabTest.answer||vocabTest.answer.endsWith(" "))return;
    vocabTest.answer+=" ";renderVocabTestAnswer();
  };
  pad.appendChild(space);
}
function renderVocabTestAnswer(){
  const el=$("vocabTestAnswer");
  if(!vocabTest.answer){
    el.innerHTML='<span class="testPlaceholder">Tap letters below</span>';
    return;
  }
  const words=vocabTest.answer.split(" ");
  el.innerHTML=words.map(function(word){
    return '<span class="wordGroup">'+word.split("").map(function(ch){return '<span class="letterSlot">'+ch+'</span>'}).join("")+'</span>';
  }).join('<span class="spaceGap"></span>');
}
$("vocabTestHear").onclick=function(){if(!vocabTest.locked)speakVocabTestWord()};
$("vocabTestBack").onclick=function(){if(vocabTest.locked)return;vocabTest.answer=vocabTest.answer.slice(0,-1);renderVocabTestAnswer()};
$("vocabTestClear").onclick=function(){if(vocabTest.locked)return;vocabTest.answer="";renderVocabTestAnswer()};
$("vocabTestSubmit").onclick=function(){
  if(vocabTest.locked||!vocabTest.answer.trim()){
    const f=$("vocabTestFeedback");f.className="feedback try show";f.innerHTML="<b>Spell the word first.</b>";
    return;
  }
  vocabTest.locked=true;
  try{if("speechSynthesis" in window)window.speechSynthesis.cancel()}catch(e){}
  const item=VOCAB[vocabTest.items[vocabTest.i]];
  const answer=vocabTest.answer.trim().replace(/\s+/g," ");
  const correct=answer===item.word;
  vocabTest.results.push({word:item.word,answer:answer,correct:correct});
  const f=$("vocabTestFeedback");
  f.className="feedback good show";
  f.innerHTML="<b>Done ✓</b> Next word…";
  later(function(){
    vocabTest.i++;
    if(vocabTest.i>=12)finishVocabTest();
    else animateSwap("vocabTestCard",loadVocabTest);
  },520);
};
function finishVocabTest(){
  const correctCount=vocabTest.results.filter(function(r){return r.correct}).length;
  const score=correctCount*3;
  const record={ts:Date.now(),score:score,maxScore:36,total:12,correctCount:correctCount,results:vocabTest.results};
  if(!Array.isArray(state.vocabTestHistory))state.vocabTestHistory=[];
  state.vocabTestHistory.unshift(record);
  if(state.vocabTestHistory.length>100)state.vocabTestHistory=state.vocabTestHistory.slice(0,100);
  state.stars+=Math.max(1,correctCount);
  if(score===36)state.snacks+=3;
  save();
  $("vocabResultScore").textContent=score+"/36";
  $("vocabResultCount").textContent=correctCount+"/12 words exact";
  $("vocabResultMsg").textContent=score===36?"Perfect Part A test! 🏆":score>=33?"Excellent — almost perfect. 🌟":score>=27?"Good progress — review the missed words. 💪":"Keep practising the missed words, then try another test. 📚";
  $("vocabResultList").innerHTML=vocabTest.results.map(function(r){
    return '<div class="testResultRow '+(r.correct?'correct':'wrong')+'"><span>'+(r.correct?'✅':'❌')+'</span><div><b>'+r.word+'</b>'+(r.correct?'':'<small>Aaron entered: '+(r.answer||'—')+'</small>')+'</div><strong>'+(r.correct?'+3':'+0')+'</strong></div>';
  }).join("");
  showView("vocabResult");
  later(function(){celebrate("vocabResultPet",correctCount,score===36)},300);
}
$("vocabTestAgain").onclick=function(){startVocabTest()};
$("vocabResultHistory").onclick=function(){showVocabHistory()};

function startVocab(){
  vocab={i:0,selected:[],order:[],locked:false};
  showView("vocab");
  later(loadVocab,250);
}
function vocabTarget(){return VOCAB[vocab.i].word.replace(/\s/g,"")}
function vocabBuilt(){return vocab.selected.map(id=>vocab.order.find(x=>x.id===id).ch).join("")}
function loadVocab(){
  const item=VOCAB[vocab.i];
  vocab.selected=[];vocab.order=[];vocab.locked=false;
  $("vocabBadge").textContent=`Word ${vocab.i+1} of 12`;
  $("vocabProgress").style.width=`${(vocab.i/12)*100}%`;
  $("vocabDoneCount").textContent=`${vocab.i}/12 learned • school chooses 10`;
  $("vocabClue").textContent=`${item.icon}  ${item.hint}`;
  $("vocabPlay").style.display="none";
  $("vocabFeedback").className="feedback";
  startCountdown("vocabPreview","vocabTimer",`${item.icon}  ${item.word}`,4,setupVocab);
}
function setupVocab(){
  const letters=[...vocabTarget()];
  vocab.order=shuffle(letters.map((ch,id)=>({id,ch})));
  vocab.selected=[];
  $("vocabPlay").style.display="block";
  renderVocab();
  later(()=>$("vocabPlay").scrollIntoView({behavior:"smooth",block:"center"}),80);
}
function renderVocab(){
  const item=VOCAB[vocab.i],built=[...vocabBuilt()];
  let p=0;
  $("vocabSlots").innerHTML=item.word.split(" ").map(word=>{
    const slots=[...word].map(()=>`<span class="letterSlot">${built[p++]||""}</span>`).join("");
    return `<span class="wordGroup">${slots}</span>`;
  }).join('<span class="spaceGap"></span>');
  $("vocabBank").innerHTML="";
  vocab.order.forEach(tile=>{
    const b=document.createElement("button");
    b.className="tile letter"+(vocab.selected.includes(tile.id)?" used":"");
    b.textContent=tile.ch;
    b.onclick=()=>{
      if(vocab.locked||vocab.selected.includes(tile.id)||vocab.selected.length>=vocabTarget().length)return;
      vocab.selected.push(tile.id);renderVocab();
      if(vocab.selected.length===vocabTarget().length)checkVocab();
    };
    $("vocabBank").appendChild(b);
  });
}
function checkVocab(){
  if(vocab.locked)return;
  const f=$("vocabFeedback");
  if(vocabBuilt()===vocabTarget()){
    vocab.locked=true;
    const snack=(vocab.i+1)%3===0;
    state.stars+=2;if(snack)state.snacks++;
    if(!state.vocabDone.includes(vocab.i))state.vocabDone.push(vocab.i);
    save();celebrate("vocabMascot",2,snack);
    f.className="feedback good show";
    f.innerHTML=`<b>Perfect spelling! 🌟</b> +2 ⭐${snack?" +1 🍪":""}`;
    later(()=>{
      vocab.i++;
      if(vocab.i>=VOCAB.length){
        state.stars+=4;save();showView("home");
        later(()=>{$("homeSpeech").textContent="Part A complete — all 12 words covered! 🎓";celebrate("homePet",4,true)},320);
      }else animateSwap("vocabCard",loadVocab);
    },900);
  }else{
    f.className="feedback try show";
    f.innerHTML="<b>Almost.</b> Check the order of the letters. You can use Back or Look again.";
  }
}
$("vocabBack").onclick=()=>{if(vocab.locked)return;vocab.selected.pop();renderVocab()};
$("vocabPeek").onclick=()=>{if(!vocab.locked)loadVocab()};
$("vocabCheck").onclick=()=>{if(vocab.selected.length)checkVocab()};

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


/* PART B TEST + GUIDED MARKING + HISTORY */
function partBHistory(){return Array.isArray(state.partBTestHistory)?state.partBTestHistory:[]}
function partBMeta(t){
  const score=Number(t.score||0),perfect=Number(t.perfect||0),wordErrors=Number(t.wordErrors||0),punctErrors=Number(t.punctErrors||0);
  return {score:score,pct:Math.round(score/60*100),perfect:perfect,wordErrors:wordErrors,punctErrors:punctErrors};
}
function renderPartBHistorySummary(){
  const box=$("partBHistorySummary");if(!box)return;
  const h=partBHistory();
  if(!h.length){
    box.innerHTML='<div class="historyEmpty">No Part B test yet. Scores will appear here after parent marking.</div>';
    return;
  }
  const latest=partBMeta(h[0]);
  const best=Math.max.apply(null,h.map(function(x){return partBMeta(x).score}));
  const last5=h.slice(0,5);
  const avg=(last5.reduce(function(s,x){return s+partBMeta(x).score},0)/last5.length).toFixed(1);
  const bars=last5.slice().reverse().map(function(x){
    const m=partBMeta(x);
    return '<span class="trendBar" title="'+m.score+'/60"><i style="height:'+Math.max(8,m.pct)+'%"></i></span>';
  }).join("");
  box.innerHTML='<div class="historyStats">'+
    '<div><b>'+latest.score+'/60</b><small>Latest</small></div>'+
    '<div><b>'+best+'/60</b><small>Best</small></div>'+
    '<div><b>'+avg+'/60</b><small>Avg last '+last5.length+'</small></div>'+
    '</div><div class="trendWrap"><span>Recent</span><div class="trendBars">'+bars+'</div></div>';
}
function showPartBHistory(){
  renderPartBHistoryFull();
  showView("partBHistory");
}
function renderPartBHistoryFull(){
  const h=partBHistory(),summary=$("partBHistoryTop"),list=$("partBHistoryList");
  if(!h.length){
    summary.innerHTML='<b>No tests yet.</b> Finish a Part B test and parent marking first.';
    list.innerHTML="";
    return;
  }
  const best=Math.max.apply(null,h.map(function(x){return partBMeta(x).score}));
  const avg=(h.reduce(function(s,x){return s+partBMeta(x).score},0)/h.length).toFixed(1);
  summary.innerHTML='<b>'+h.length+' test'+(h.length===1?'':'s')+'</b> • Best '+best+'/60 • Overall average '+avg+'/60';
  list.innerHTML=h.map(function(t){
    const m=partBMeta(t);
    const details=(t.marks||[]).map(function(mark,n){
      const deduction=(mark.wordErrors||0)*3+(mark.punctErrors||0);
      return '<div class="bHistorySentence '+(deduction===0?'perfect':'review')+'">'+
        '<span class="historyAnswerNum">'+(n+1)+'</span>'+
        '<div><b>'+SENTENCES[n].text+'</b><small>'+(deduction===0?'Perfect sentence':(mark.wordErrors||0)+' word/spelling • '+(mark.punctErrors||0)+' capital/punctuation')+'</small></div>'+
        '<strong>'+(deduction===0?'✅':'−'+deduction)+'</strong>'+
      '</div>';
    }).join("");
    return '<div class="historyEntry">'+
      '<div class="historyRow">'+
        '<div class="historyScore '+(m.score>=54?'great':m.score>=42?'ok':'needs')+'">'+m.score+'<span>/60</span></div>'+
        '<div class="historyDetails"><b>'+formatTestDate(t.ts)+'</b><small>'+m.perfect+'/8 perfect sentences</small>'+
        '<div class="missedWords">'+m.wordErrors+' word/spelling error'+(m.wordErrors===1?'':'s')+' • '+m.punctErrors+' capital/punctuation error'+(m.punctErrors===1?'':'s')+'</div></div>'+
      '</div>'+
      '<details class="historyAnswers"><summary>See sentence-by-sentence marking</summary><div class="historyAnswerList">'+details+'</div></details>'+
    '</div>';
  }).join("");
}
function partBSpokenText(i){
  if(i===4)return "Open quotation mark. Oh, no! Close quotation mark. says Joe.";
  if(i===5)return "Open quotation mark. I'm in the wrong class. Close quotation mark.";
  return SENTENCES[i].text;
}
function stopPartBSpeech(){
  try{if("speechSynthesis" in window)window.speechSynthesis.cancel()}catch(e){}
  partBTest.speaking=false;
}
function speakPartBSentence(){
  if(partBTest.speaking)return;
  const status=$("partBTestListenStatus");
  if(!("speechSynthesis" in window)){
    status.textContent="Audio is unavailable. A parent can read the sentence aloud.";
    return;
  }
  partBTest.speaking=true;
  try{
    window.speechSynthesis.cancel();
    let pass=0;
    function speakPass(){
      const intro=new SpeechSynthesisUtterance(pass===0?"Sentence "+(partBTest.i+1)+".":"Again.");
      intro.lang="en-GB";intro.rate=.82;
      const line=new SpeechSynthesisUtterance(partBSpokenText(partBTest.i));
      line.lang="en-GB";line.rate=.72;line.pitch=1;
      intro.onstart=function(){status.textContent=pass===0?"First reading… 🔊":"Second reading… 🔊"};
      intro.onend=function(){setTimeout(function(){window.speechSynthesis.speak(line)},220)};
      line.onend=function(){
        pass++;
        if(pass<2)setTimeout(speakPass,700);
        else{partBTest.speaking=false;status.textContent="Now write the sentence on paper. Tap Hear again if needed."}
      };
      line.onerror=function(){partBTest.speaking=false;status.textContent="Tap Hear again to try once more."};
      window.speechSynthesis.speak(intro);
    }
    speakPass();
  }catch(e){
    partBTest.speaking=false;
    status.textContent="Tap Hear again to try once more.";
  }
}
function startPartBTest(){
  stopPartBSpeech();
  partBTest={i:0,markI:0,marks:[],speaking:false};
  showView("partBTest");
  later(loadPartBTestSentence,250);
}
function loadPartBTestSentence(){
  stopPartBSpeech();
  $("partBTestBadge").textContent="Sentence "+(partBTest.i+1)+" of 8";
  $("partBTestProgress").style.width=((partBTest.i/8)*100)+"%";
  $("partBTestListenStatus").textContent="Tap Hear sentence. It will be read twice.";
  $("partBTestDoneFeedback").className="feedback";
}
$("partBTestHear").onclick=function(){speakPartBSentence()};
$("partBTestDone").onclick=function(){
  if(partBTest.speaking)stopPartBSpeech();
  const f=$("partBTestDoneFeedback");
  f.className="feedback good show";f.innerHTML="<b>Done ✓</b> Next sentence…";
  later(function(){
    partBTest.i++;
    if(partBTest.i>=8)startPartBMarking();
    else animateSwap("partBTestCard",loadPartBTestSentence);
  },520);
};
function startPartBMarking(){
  stopPartBSpeech();
  partBTest.markI=0;
  partBTest.marks=Array.from({length:8},function(){return {wordErrors:0,punctErrors:0}});
  showView("partBMark");
  later(loadPartBMarkSentence,250);
}
function currentBMark(){return partBTest.marks[partBTest.markI]}
function renderPartBMarkCounters(){
  const m=currentBMark();
  $("partBWordCount").textContent=m.wordErrors;
  $("partBPunctCount").textContent=m.punctErrors;
  const deduction=m.wordErrors*3+m.punctErrors;
  $("partBSentenceDeduction").textContent=deduction===0?"Perfect sentence ✅":"Current deduction: −"+deduction;
}
function loadPartBMarkSentence(){
  const m=currentBMark();
  $("partBMarkBadge").textContent="Check sentence "+(partBTest.markI+1)+" of 8";
  $("partBMarkProgress").style.width=((partBTest.markI/8)*100)+"%";
  $("partBCorrectSentence").textContent=SENTENCES[partBTest.markI].text;
  renderPartBMarkCounters();
  $("partBMarkNext").textContent=partBTest.markI===7?"Finish marking ✅":"Next sentence ➜";
}
$("partBWordMinus").onclick=function(){const m=currentBMark();m.wordErrors=Math.max(0,m.wordErrors-1);renderPartBMarkCounters()};
$("partBWordPlus").onclick=function(){const m=currentBMark();m.wordErrors++;renderPartBMarkCounters()};
$("partBPunctMinus").onclick=function(){const m=currentBMark();m.punctErrors=Math.max(0,m.punctErrors-1);renderPartBMarkCounters()};
$("partBPunctPlus").onclick=function(){const m=currentBMark();m.punctErrors++;renderPartBMarkCounters()};
$("partBMarkNext").onclick=function(){
  if(partBTest.markI>=7)finishPartBTest();
  else{partBTest.markI++;animateSwap("partBMarkCard",loadPartBMarkSentence)}
};
function finishPartBTest(){
  const wordErrors=partBTest.marks.reduce(function(s,m){return s+m.wordErrors},0);
  const punctErrors=partBTest.marks.reduce(function(s,m){return s+m.punctErrors},0);
  const perfect=partBTest.marks.filter(function(m){return m.wordErrors===0&&m.punctErrors===0}).length;
  const score=Math.max(0,60-wordErrors*3-punctErrors);
  const record={ts:Date.now(),score:score,perfect:perfect,wordErrors:wordErrors,punctErrors:punctErrors,marks:partBTest.marks.map(function(m){return {wordErrors:m.wordErrors,punctErrors:m.punctErrors}})};
  if(!Array.isArray(state.partBTestHistory))state.partBTestHistory=[];
  state.partBTestHistory.unshift(record);
  if(state.partBTestHistory.length>100)state.partBTestHistory=state.partBTestHistory.slice(0,100);
  state.stars+=Math.max(1,Math.round(score/10));
  if(score===60)state.snacks+=3;
  save();
  $("partBResultScore").textContent=score+"/60";
  $("partBPerfectCount").textContent=perfect+"/8 perfect sentences";
  $("partBErrorSummary").textContent=wordErrors+" word/spelling error"+(wordErrors===1?"":"s")+" • "+punctErrors+" capital/punctuation error"+(punctErrors===1?"":"s");
  $("partBResultMsg").textContent=score===60?"Perfect Part B dictation! 🏆":score>=54?"Excellent — very close to perfect. 🌟":score>=48?"Strong result — review the marked sentences. 💪":"Review the sentences with deductions, then practise again. 📚";
  $("partBResultList").innerHTML=partBTest.marks.map(function(m,n){
    const deduction=m.wordErrors*3+m.punctErrors;
    return '<div class="testResultRow '+(deduction===0?'correct':'wrong')+'"><span>'+(deduction===0?'✅':'✏️')+'</span>'+
      '<div><b>Sentence '+(n+1)+'</b><small>'+SENTENCES[n].text+'</small>'+
      (deduction===0?'':'<small>'+m.wordErrors+' word/spelling • '+m.punctErrors+' capital/punctuation</small>')+'</div>'+
      '<strong>'+(deduction===0?'Perfect':'−'+deduction)+'</strong></div>';
  }).join("");
  showView("partBResult");
  later(function(){celebrate("partBResultPet",Math.max(1,perfect),score===60)},300);
}
$("partBTestAgain").onclick=function(){startPartBTest()};
$("partBResultHistory").onclick=function(){showPartBHistory()};

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
