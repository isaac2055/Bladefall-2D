(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.BladefallBlood=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION=3,BASE_MEASURES=5,MAX_BONUS=2,MAX_PROTECTION=.25;
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  // Blood is a hit reserve, not a conventional health bar. Five authored
  // Knots span two whole-measure upgrades: the third completes measure six and
  // the fifth completes measure seven. Old fractional saves are rounded to a
  // whole measure so the HUD can never imply "part of a hit" again.
  function maxMeasures(vitalityKnots){
    const knots=Math.max(0,Math.floor(Number(vitalityKnots)||0));
    return BASE_MEASURES+(knots>=3?1:0)+(knots>=5?1:0);
  }
  function severity(){return 1;}
  function protection(defense){return clamp(Number(defense)||0,0,MAX_PROTECTION);}
  function loss(){return 1;}
  function normalize(player,vitalityKnots){
    const max=maxMeasures(vitalityKnots);
    const current=Number.isFinite(player&&player.blood)?Math.round(player.blood):max;
    const guard=clamp(Number(player&&player.bloodGuard)||0,0,.999999);
    const recovery=clamp(Number(player&&player.bloodRecovery)||0,0,.999999);
    return{blood:clamp(current,0,max),maxBlood:max,guard,recovery};
  }
  function apply(player,damage,defense,real,vitalityKnots){
    const before=normalize(player,vitalityKnots),ward=protection(defense);
    // Armor banks its protection until it can prevent one entire wound. It
    // never shaves a visible Blood measure into a misleading fraction.
    let guard=before.guard+ward,blocked=false;
    if(guard>=1){guard-=1;blocked=true;}
    const blood=blocked?before.blood:clamp(before.blood-1,0,before.maxBlood);
    return{blood,maxBlood:before.maxBlood,lost:before.blood-blood,severity:1,
      protection:ward,guard,blocked,dead:blood<=0};
  }
  function restore(player,amount,vitalityKnots){
    const before=normalize(player,vitalityKnots);
    if(amount===Infinity)return{blood:before.maxBlood,maxBlood:before.maxBlood,
      restored:before.maxBlood-before.blood,recovery:0};
    const total=before.recovery+Math.max(0,Number(amount)||0),whole=Math.floor(total+1e-9);
    const value=clamp(before.blood+whole,0,before.maxBlood);
    return{blood:value,maxBlood:before.maxBlood,restored:value-before.blood,
      recovery:value>=before.maxBlood?0:total-whole};
  }
  function label(value){return String(Math.max(0,Math.round(Number(value)||0)));}
  return Object.freeze({VERSION,BASE_MEASURES,MAX_BONUS,MAX_PROTECTION,maxMeasures,severity,protection,loss,normalize,apply,restore,label});
});
