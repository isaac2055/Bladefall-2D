extends RefCounted
## B and C sides are challenges, without family scenes or story-gated abilities.
var phase="black"
var gifts={"legs":true,"cape":true,"arms":true,"face":true,"sword":true,"dagger":true,"counter":true}
var lines=[]
var hint={"text":"","life":0.0}
var freeze=0
var ride=null
var pulse_request=0.0
var door_slam=false
var photos=[]
var tracker
var number=21
func _init(world): number=int(world.data.world.n)
func title():
 var home=number-100 if number>=101 else number-20
 return [("Core" if number>=101 else "Fractured")+" "+["","Outskirts","Woods","Causeway"][home],"a darker path"]
func start(): phase="play"
func skip_prologue(): start()
func blocking(): return phase in ["black","end"] or (tracker!=null and tracker.failure_frames>0)
func tick(world,_sim,delta):
 hint.life=maxf(0,hint.life-delta)
 if phase!="play" or tracker==null: return
 tracker.tick(world)
 if not tracker.result.is_empty(): phase="end"
func music_level(): return -12.0
func end_stats():
 return "%d falls   ·   %s\n%s"%[tracker.profile.run.deaths,tracker.profile.duration(tracker.profile.run.frames),tracker.result.get("award","")]
