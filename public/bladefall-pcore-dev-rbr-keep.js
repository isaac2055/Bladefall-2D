/* Precision Core — Room by Room · Ruined Keep (7.259): the keystone.

   The keystone is the core's lantern ('l'): grab carries it, grab again throws it (down + grab sets it down),
   it slows your fall while carried, it rests on plates ('_') and holds every door ('H') while it does, and a
   keystone lost to thorns or a pit floats home. Nothing about it needs new simulation, so this module simulates
   nothing and registers no device: every taped room replays identically with or without it.
   It exists so the Room by Room page can load its drawing, bladefall-pcore-dev-rbr-keep-view.js, which draws the
   lantern as masonry in the Ruined Keep's rooms (and as the Archivist's book box where a room says crate:true). */
(function(root){
'use strict';
root.BladefallRbrKeep=Object.freeze({name:'rbr-keep',keystone:true});
})(typeof window!=='undefined'?window:globalThis);
