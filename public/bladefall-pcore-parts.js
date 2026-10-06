/* Precision Core — later parts (7.254+). Each part file (bladefall-pcore-part-NNN-name.js, NNN = its first
   level) calls addPart once with its chapters, its part title for the menu, and one intended tape per room.
   Chapters append in level order: the chapter index is the level number, so nothing earlier moves. */
(function(root){
'use strict';
const R=root.BladefallPrecisionRooms;
R.partTitles=R.partTitles||{};
R.addPart=function({part,title,chapters,tapes}){
 if(title)R.partTitles[part]=title;
 for(const c of chapters){c.part=c.part||part;R.chapters.push(c);}
 // Keep later chapters in level order whatever order the part files load in (bonus chapters, with no
 // level, stay last in the order they came).
 const early=R.chapters.filter(c=>c.level===undefined&&!c.bonus),late=R.chapters.filter(c=>c.level!==undefined).sort((a,b)=>a.level-b.level),bonus=R.chapters.filter(c=>c.level===undefined&&c.bonus);
 R.chapters.length=0;R.chapters.push(...early,...late,...bonus);
 R.all=R.chapters.flatMap(c=>c.rooms);
 Object.assign(R.tapes,tapes||{});
};
})(typeof window!=='undefined'?window:globalThis);
