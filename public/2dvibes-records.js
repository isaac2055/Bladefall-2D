// Read only this browser's personal scores. Never transmit tokens, identity,
// feedback, remote scores, recordings, or save files.
(()=>{
 const allowed=new Set(['https://2dvibes.com','https://www.2dvibes.com','https://2dvibes.pages.dev']);
 let parentOrigin;try{parentOrigin=new URL(document.referrer).origin;}catch{return;}
 if(window.parent===window||!allowed.has(parentOrigin))return;
 function send(){try{const saved=JSON.parse(localStorage.getItem('bladefall.playtest.v1')||'{}');const records=(Array.isArray(saved.records)?saved.records:[]).slice(0,10000).map(r=>({world:r.world,mode:r.mode,campaign:r.campaign,season:r.season,ms:r.ms,deaths:r.deaths,at:r.at}));parent.postMessage({type:'2dvibes:local-records',records},parentOrigin);}catch{parent.postMessage({type:'2dvibes:local-records',error:'storage-unavailable'},parentOrigin);}}
 window.addEventListener('message',event=>{if(event.source===parent&&event.origin===parentOrigin&&event.data?.type==='2dvibes:request-local-records')send();});
 window.addEventListener('storage',event=>{if(event.key==='bladefall.playtest.v1')send();});send();setInterval(send,5000);
})();
