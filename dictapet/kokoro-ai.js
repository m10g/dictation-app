(function(){
"use strict";
const MODULE_URL="https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm";
const MODEL_ID="onnx-community/Kokoro-82M-v1.0-ONNX";
const VOICE="bf_emma";
const CACHE_NAME="dictapet-kokoro-audio-v1";
let ttsPromise=null,activeAudio=null;

function report(cb,msg){try{if(cb)cb(msg)}catch(e){}}

async function load(statusCb){
  if(ttsPromise)return ttsPromise;
  ttsPromise=(async()=>{
    report(statusCb,"First use: loading the free AI voice…");
    const {KokoroTTS}=await import(MODULE_URL);
    const tts=await KokoroTTS.from_pretrained(MODEL_ID,{
      dtype:"q8",
      device:"wasm",
      progress_callback:(p)=>{
        let pct=null;
        if(typeof p?.progress==="number") pct=Math.round(p.progress);
        else if(p?.loaded&&p?.total) pct=Math.round(p.loaded/p.total*100);
        if(Number.isFinite(pct)) report(statusCb,"First use: loading the free AI voice… "+Math.max(0,Math.min(100,pct))+"%");
      }
    });
    report(statusCb,"AI voice ready.");
    return tts;
  })();
  try{return await ttsPromise}catch(e){ttsPromise=null;throw e}
}

async function cacheGet(key){
  if(!("caches" in window))return null;
  try{
    const c=await caches.open(CACHE_NAME);
    const req=new Request(location.origin+"/__dictapet_audio__/"+encodeURIComponent(key)+".wav");
    const res=await c.match(req);
    return res?await res.blob():null;
  }catch(e){return null}
}
async function cachePut(key,blob){
  if(!("caches" in window))return;
  try{
    const c=await caches.open(CACHE_NAME);
    const req=new Request(location.origin+"/__dictapet_audio__/"+encodeURIComponent(key)+".wav");
    await c.put(req,new Response(blob,{headers:{"Content-Type":"audio/wav"}}));
  }catch(e){}
}

async function synthesize(key,text,speed,statusCb){
  const hit=await cacheGet(key);
  if(hit){report(statusCb,"AI voice ready — playing…");return hit}
  const tts=await load(statusCb);
  report(statusCb,"Creating this sentence with the free AI voice…");
  const audio=await tts.generate(text,{voice:VOICE,speed:speed});
  const blob=audio.toBlob();
  await cachePut(key,blob);
  return blob;
}

function stop(){
  if(activeAudio){
    try{activeAudio.pause();activeAudio.src=""}catch(e){}
    activeAudio=null;
  }
}

async function play({key,text,speed=0.95,onStatus}){
  stop();
  const blob=await synthesize(key,text,speed,onStatus);
  const url=URL.createObjectURL(blob);
  return await new Promise((resolve,reject)=>{
    const a=new Audio(url);
    activeAudio=a;
    a.onended=()=>{URL.revokeObjectURL(url);activeAudio=null;resolve()};
    a.onerror=()=>{URL.revokeObjectURL(url);activeAudio=null;reject(new Error("AI audio playback failed"))};
    report(onStatus,"AI dictation playing… 🔊");
    const p=a.play();
    if(p&&p.catch)p.catch(reject);
  });
}

window.DictaPetAI={play,stop,voice:VOICE,model:MODEL_ID};
})();