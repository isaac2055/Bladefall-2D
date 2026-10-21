/* (7.366) Publish a saved edit of a game level to every player.
   The editor's "Publish to game" writes the level into public/bladefall-published-levels.js on the game's GitHub repo
   (main). Cloudflare Pages rebuilds the site from main, and every player's game reads that file at start
   (bladefall-workshop-applied.js), so the edit is live within a minute or two, with nothing else to deploy.
   Only someone holding a GitHub token with write access to the repo can publish; the token stays on this device
   (localStorage) and is only ever sent to api.github.com. "Remove from game" takes a level back out. */
(function(root){
'use strict';
const KEY='bladefall.publish.v1',PATH='public/bladefall-published-levels.js',REPO='isaac2055/Bladefall-2D',BRANCH='main';
const A=()=>root.BladefallWorkshopApplied;
function config(){try{const c=JSON.parse(root.localStorage.getItem(KEY)||'null');return c&&c.token?{repo:REPO,branch:BRANCH,...c}:null;}catch(_e){return null;}}
function setConfig(c){try{if(c)root.localStorage.setItem(KEY,JSON.stringify(c));else root.localStorage.removeItem(KEY);return true;}catch(_e){return false;}}
function slot(doc){const key=A()?.keyOf(doc);return key?{mode:key.slice(0,key.indexOf(':')),id:key.slice(key.indexOf(':')+1)}:null;}
const can=doc=>!!slot(doc)&&!root.BLADEFALL_WORKSHOP_PLAY&&!root.BLADEFALL_WORKSHOP_SOURCE;

async function gh(c,path,init={}){
 const r=await root.fetch('https://api.github.com/repos/'+c.repo+path,{...init,headers:{Authorization:'Bearer '+c.token,Accept:init.accept||'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(init.body?{'Content-Type':'application/json'}:{})}});
 return r;
}
const b64=text=>{const bytes=new TextEncoder().encode(text);let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return root.btoa(bin);};
const unb64=b=>new TextDecoder().decode(Uint8Array.from(root.atob(b.replace(/\s+/g,'')),ch=>ch.charCodeAt(0)));
const HEADER=`/* Level edits published from the in-game editor ("Publish to game"), for every player. Written through GitHub by
   bladefall-workshop-publish.js; read at start by bladefall-workshop-applied.js. Ascend entries hold compiled rooms,
   Explore entries hold editor definitions, keyed by room id / stage index. Edit with the editor, not by hand. */
`;
function parse(text){const i=text.indexOf('BLADEFALL_PUBLISHED_LEVELS='),j=text.lastIndexOf('}');if(i<0||j<0)throw Error('The published levels file is not in the expected format.');const data=JSON.parse(text.slice(text.indexOf('{',i),j+1));data.ascend=data.ascend||{};data.explore=data.explore||{};return data;}
const render=data=>HEADER+'globalThis.BLADEFALL_PUBLISHED_LEVELS='+JSON.stringify(data)+';\n';
async function read(c){
 const r=await gh(c,'/contents/'+PATH+'?ref='+encodeURIComponent(c.branch));
 if(r.status===404)return {sha:null,data:{version:1,ascend:{},explore:{}}};
 if(r.status===401||r.status===403)throw Error('GitHub refused the token ('+r.status+'). Set up publishing again with a token that can write to '+c.repo+'.');
 if(!r.ok)throw Error('Could not read the published levels from GitHub ('+r.status+').');
 const meta=await r.json();let text=meta.content?unb64(meta.content):'';
 if(!text){const raw=await gh(c,'/contents/'+PATH+'?ref='+encodeURIComponent(c.branch),{accept:'application/vnd.github.raw'});if(!raw.ok)throw Error('Could not read the published levels from GitHub ('+raw.status+').');text=await raw.text();}
 return {sha:meta.sha,data:parse(text)};
}
async function write(c,change,message){
 for(let attempt=0;attempt<3;attempt++){
  const cur=await read(c);change(cur.data);
  const body={message,content:b64(render(cur.data)),branch:c.branch};if(cur.sha)body.sha=cur.sha;
  const r=await gh(c,'/contents/'+PATH,{method:'PUT',body:JSON.stringify(body)});
  if(r.ok){root.BLADEFALL_PUBLISHED_LEVELS=cur.data;const out=await r.json();return out.commit?.html_url||null;}
  if(r.status===409||r.status===422)continue;   // someone published in between: read again and retry
  if(r.status===401||r.status===403||r.status===404)throw Error('GitHub refused the write ('+r.status+'). The token needs Contents: read and write on '+c.repo+'.');
  throw Error('GitHub could not save the level ('+r.status+').');
 }
 throw Error('The published levels kept changing while saving. Try again.');
}
function entry(doc,s){
 const base={name:doc.name,revision:doc.revision,publishedAt:new Date().toISOString()};
 if(s.mode==='ascend'){const room=root.BladefallWorkshopAscend.compile(doc.definition);delete room.route;return {...base,room};}
 root.BladefallWorkshopExplore.compile(doc.definition);return {...base,definition:root.BladefallWorkshopModel.json(doc.definition)};
}
async function publish(doc){
 const s=slot(doc);if(!s)throw Error('Only an edit of one of the game’s own levels can be published.');
 const c=config()||await setup();if(!c)throw Error('Publishing is not set up on this device.');
 const e=entry(doc,s);   // throws if the level does not compile, before anything is sent
 const link=await write(c,data=>{data[s.mode][s.id]=e;},'Publish level from the editor: '+doc.name+' ('+s.mode+' '+s.id+', revision '+doc.revision+')');
 return {link,message:'Published to the game. Every player gets this level within a minute or two (once the site rebuilds).'};
}
async function unpublish(doc){
 const s=slot(doc);if(!s)throw Error('This is not one of the game’s levels.');const c=config()||await setup();if(!c)throw Error('Publishing is not set up on this device.');
 let had=false;const link=await write(c,data=>{had=!!data[s.mode][s.id];delete data[s.mode][s.id];},'Remove published level: '+doc.name+' ('+s.mode+' '+s.id+')');
 return {link,message:had?'Removed from the game. Players go back to the original level once the site rebuilds.':'This level was not published.'};
}
/* One-time setup on a device: a fine-grained GitHub token with Contents read/write on the game's repository. */
async function setup(){
 const token=(root.prompt('Publish to game — one-time setup on this device.\n\nPaste a GitHub fine-grained personal access token for '+REPO+' with "Contents: Read and write" permission (github.com → Settings → Developer settings → Fine-grained tokens). It stays on this device and is only sent to GitHub.\n\nLeave empty to cancel.')||'').trim();
 if(!token)return null;
 const c={repo:REPO,branch:BRANCH,token},r=await gh(c,'');
 if(!r.ok)throw Error('GitHub did not accept that token for '+REPO+' ('+r.status+').');
 const info=await r.json();if(info.permissions&&!info.permissions.push)throw Error('That token cannot write to '+REPO+'.');
 setConfig(c);return c;
}
function forget(){return setConfig(null);}
function status(doc){const s=slot(doc);if(!s)return null;return {configured:!!config(),published:A()?.published(s.mode,s.id)||null};}
root.BladefallWorkshopPublish=Object.freeze({can,publish,unpublish,setup,forget,status,configured:()=>!!config(),parse,render});
})(globalThis);
