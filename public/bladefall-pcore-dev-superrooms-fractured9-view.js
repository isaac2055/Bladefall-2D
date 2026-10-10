/* The support pin visibly cracks before F70's native floor falls. */
(function(root){'use strict';
function draw(b,g){const s=g.wardenFloor;if(!s)return;const a=g.ents.find(e=>e.type==='hingeArm'&&e.label===s.hinge);if(!a)return;const x=a.pivotX+4,y=a.pivotY-8;
 b.fillStyle=s.state==='released'?'#514d50':'#b99c65';b.fillRect(x-5,y,10,6);b.fillStyle='#292c35';b.fillRect(x-2,y+1,4,3);
 if(s.state==='cracking'){b.fillStyle='#ffe3a1';b.fillRect(x-4,y+2,3,1);b.fillRect(x+1,y+3,4,1);const n=Math.ceil(Math.max(0,s.left)/(s.fuse||80)*6);for(let i=0;i<6;i++){b.fillStyle=i<n?'#edc88b':'#534b47';b.fillRect(x-8+i*3,y-4,2,2);}}
 if(s.state==='released'){b.fillStyle='#ae9970';b.fillRect(x-6,y+4,3,1);b.fillRect(x+3,y+5,3,1);}
}
(root.BladefallPrecisionDeviceViews=root.BladefallPrecisionDeviceViews||[]).push({name:'superrooms-fractured9',draw});
})(typeof window!=='undefined'?window:globalThis);
