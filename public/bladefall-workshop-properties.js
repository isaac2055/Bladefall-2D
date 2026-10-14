/* Friendly controls for common native devices. Advanced data stays available in the JSON inspector. */
(function(root){
'use strict';
const M=()=>root.BladefallWorkshopModel;
function fields(doc,object){
 if(!object)return [];const p=object.data,out=[];
 const add=(key,label,value,type='number',extra={})=>out.push({key,label,value,type,...extra});
 if(doc.mode==='ascend'){
  if(p.glyph==='Z'){add('travelX','Horizontal travel (tiles)',p.settings?.[0]??0,'number',{integer:true});add('travelY','Vertical travel (tiles; down is positive)',p.settings?.[1]??-4,'number',{integer:true});}
  const specs=p.glyph==='E'?{stone:90,molten:60,glass:45,offset:0}:p.glyph==='X'?{open:60,shut:60,offset:0}:null;
  if(specs){for(const[key,fallback]of Object.entries(specs))add(key,key==='offset'?'Cycle offset (frames)':key[0].toUpperCase()+key.slice(1)+' duration (frames)',p.settings?.[key]??fallback,'number',{integer:true,...key==='offset'?{}:{min:0}});if(p.glyph==='E')add('start','Starting phase',p.settings?.start||'stone','choice',{choices:['stone','molten','glass']});}
 }else{
  const n=(key,label,fallback,min=0)=>add(key,label,p[key]??fallback,'number',{min}),text=(key,label,fallback)=>add(key,label,p[key]??fallback,'text'),bool=(key,label)=>add(key,label,!!p[key],'boolean');
  if(p.type==='plat'){bool('crumble','Crumble when stood on');bool('ice','Slippery surface');}
  if(p.type==='spikes'){n('period','Cycle length (seconds)',2.4,.01);n('upT','Raised time (seconds)',1);n('phase','Cycle offset (seconds)',0,-1000000);n('dmg','Damage',12);}
  if(p.type==='spring')n('pow','Launch speed',930,1);
  if(p.type==='lever'){text('id','Circuit name','new-circuit');n('dur','Active time (seconds)',4,.01);}
  if(p.type==='plate'){text('id','Circuit name','new-circuit');bool('latch','Stay active once pressed');bool('crateOnly','Requires a crate');}
  if(p.type==='door')text('circuit','Opened by circuit','new-circuit');
  if(p.type==='lportal'){add('connection','Connection',p.portalLesson==='fixed'?'fixed':'anchor','choice',{choices:['fixed','anchor'],choiceLabels:{fixed:'Linked pair (two mouths)',anchor:'Player portal anchor'}});text('pg','Portal pair name','new-pair');add('face','Faces',p.nx<0?'left':p.nx>0?'right':p.ny<0?'down':'up','choice',{choices:['left','right','up','down']});}
 }
 return out;
}
function edit(doc,object,key,value){
 const field=fields(doc,object).find(f=>f.key===key);if(!field)throw Error('This device setting is unavailable.');
 if(field.type==='number'){if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1000000||field.integer&&!Number.isInteger(value)||field.min!==undefined&&value<field.min)throw Error('Enter a valid '+field.label.toLowerCase()+'.');}
 if(field.type==='text'&&(typeof value!=='string'||!value.trim()||value.length>160))throw Error('Enter a name between 1 and 160 characters.');
 if(field.type==='boolean'&&typeof value!=='boolean')throw Error('Choose on or off.');
 if(field.type==='choice'&&!field.choices.includes(value))throw Error('Choose one of the available settings.');
 const p=M().json(object.data);
 if(doc.mode==='ascend'){
  if(p.glyph==='Z'){p.settings=p.settings||[0,-4];p.settings[key==='travelX'?0:1]=value;}
  else{p.settings=p.settings||{};p.settings[key]=value;const total=p.glyph==='E'?(p.settings.stone??90)+(p.settings.molten??60)+(p.settings.glass??45):(p.settings.open??60)+(p.settings.shut??60);if(total<=0)throw Error('At least one phase must have a positive duration.');}
 }else if(key==='connection'){p.portalLesson=value==='fixed'?'fixed':'';p.anchor=value==='anchor';}
 else if(key==='face'){[p.nx,p.ny]=({left:[-1,0],right:[1,0],up:[0,1],down:[0,-1]})[value];}
 else p[key]=field.type==='text'?value.trim():value;
 return {path:object.path,value:p};
}
root.BladefallWorkshopProperties={fields,edit};
})(globalThis);
