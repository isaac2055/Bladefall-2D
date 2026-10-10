import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('./fractured/bank-f67.json',import.meta.url),w=64,h=48,a=Array.from({length:h},()=>Array(w).fill('.'));
const fill=(x,y,n,m,k='#')=>{for(let r=y;r<y+m;r++)for(let c=x;c<x+n;c++)a[r][c]=k;};const put=(x,y,k)=>a[y][x]=k;
fill(0,0,w,1);fill(0,h-1,w,1);fill(0,0,1,h);fill(w-1,0,1,h);
// The lower court is visible from the departure, but its bronze shutter is held upstairs.
fill(1,44,62,3);fill(1,43,15,1);put(6,42,'P');put(4,42,'l');
fill(34,30,1,14,'H');fill(33,30,1,10,'<');
// Only the moving shade gives access to the high optical/echo station.
fill(45,14,10,1);fill(45,13,10,1,'_');put(49,12,'/');put(48,12,'#');
fill(55,12,1,2,'%');fill(56,12,2,2);
// The optical court is the roof of the boss court: dropping from the mirror cannot skip the return.
fill(34,26,30,2);
// King's lower stage is reached from the same court after returning for portable shade.
fill(46,34,14,10);fill(45,35,1,8,'<');put(43,43,'b');fill(57,31,1,2,'%');fill(58,31,2,2);
fill(62,29,1,15,'G');fill(63,30,1,14,'.');
const room={id:'bank-f67',name:'The Shadow Makes the Last Bridge',palette:'sunspire',study:true,movement:'survive-2',aim8:true,cols:w,rows:h,exit:'right',echo:true,lock:['parry'],portalMode:'fixed',portals:[{color:'blue',c:55,r:12,face:'l'},{color:'orange',c:57,r:31,face:'l'}],movingHooks:[{id:'LastShadow',c:12,r:36,w:3,h:3,to:[26,-22],period:1000}],beams:[{c:20,r:0,dir:'d'},{c:38,r:0,dir:'d'},{c:38,r:27,dir:'d'},{c:49,r:0,dir:'d'}],dayKing:{c:52,r:33,need:2,beat:[220,190],wave:1,shrug:true,ripen:24,guard:32},map:a.map(x=>x.join('')),hint:'Leave an echo below. Ride the moving shade to the mirror, swap from brass, then retrieve the lantern.',question:'What must remain upstairs so that your shade can come back through the court below?',showHintAtRest:true};
// Trim the unused sky: 64×44 = 2,816 tiles, while preserving every relative movement distance.
room.rows-=4;room.map=room.map.slice(4);room.map[0]='#'.repeat(w);
for(const d of [...room.portals,...room.movingHooks,room.dayKing])d.r-=4;
for(const b of room.beams)if(b.r>0)b.r-=4;
let previous={};try{previous=JSON.parse(readFileSync(file));}catch{}
const bank={side:'fractured',batch:17,run:8,collection:'superrooms',format:'superroom',acceptance:'candidate',difficulty:5,role:'interconnected boss superroom',worlds:[40],tags:['superroom','boss','echo','moving-shade','wallbounce','portable-shade','optics'],newMechanics:[],status:'draft',author:'Codex',humanReview:'Awaiting human fun/difficulty/suitability ratings.',approvedIngredients:['bank-f45','bank-f46','bank-f57'],interconnection:'The same carrier shades the ascent and supplies its wallbounce. The high mirror sends sunlight through the fixed pair into the King below. Swapping at that mirror leaves an echo holding the lower shutter while bringing the player back to the only lantern. The lantern then shades the return crossing to the newly exposed King; the echo and optical state remain relevant through both native blooms.',solution:'Save an echo at the lower west station and leave the lantern there. Catch the moving shade, reel up beneath it, and use its eastern wall for a wallbounce onto the high pressure gallery. Turn the mirror so the beam enters the fixed upper mouth and emerges behind the King. Stand on the broad brass plate and exchange with the original echo. Collect the lantern and cross the changed lower court in its shade. Release the lantern on the stable lower shelf, pogo the pod to the King’s platform and strike from the opposite side of his routed light twice, respecting the glove and later floor wave. Take his opened eastern gate.',novelty:'Three successive roles for one high address: a moving-wall destination, an optical control and the persistent echo weight for a lower return. The boss receives the same light configured on that return’s opposite end, while the lantern deliberately stayed outside the ascent.',nearestExisting:'F45 supplies an upper address/echo return with cargo, F46 supplies a shared moving shade as a wallbounce face, and F57 supplies moving-anchor departure timing. Here their return releases a native multi-bloom King rather than just an exit.',requiredEvents:['echo-place','moving-hook','wallbounce','mirror','echo-swap','pickup','plate','held-open','dayking-bloom','dayking-yield'],requiredEventCounts:{'dayking-bloom':2}};
writeFileSync(file,JSON.stringify({room,bank,...(previous.tape?{tape:previous.tape}:{tape:[]})},null,2)+'\n');console.log('Saved F67 draft');
