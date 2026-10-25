extends SceneTree
const Main=preload("res://main.tscn")
var app
var failed=false
var comparisons=0
func _initialize(): run.call_deferred()
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 failed=failed or not ok
func fingerprint():
 var c=app.sim
 return JSON.stringify([c.p,c.ents,c.frame,c.freeze,c.events,c.combat,c.beams,c.deaths,c.flipped,app.world.frames])
func step(keys="",delta=1.0/60.0):
 var scene=app.landscape
 var before=scene.before_tick()
 app.world.step(app.decode(keys))
 var expected=fingerprint()
 var effects=scene.after_tick(before)
 app.audio.events(effects)
 scene._process(delta)
 comparisons+=1
 if fingerprint()!=expected:
  failed=true
  push_error("Presentation changed simulation at frame "+str(app.sim.frame))
 return effects
func shot(label):
 if OS.get_cmdline_user_args().is_empty(): return
 await process_frame
 await RenderingServer.frame_post_draw
 root.get_texture().get_image().save_png(OS.get_cmdline_user_args()[0]+"/"+label+".png")
func run():
 app=Main.instantiate()
 app.test_mode=true
 root.add_child(app)
 await process_frame
 app.set_physics_process(false)
 var moods={}
 for n in app.CHAPTERS:
  app.switch_chapter(n)
  app.landscape.set_process(false)
  moods[app.landscape.mood.to_html()]=true
  app.landscape._process(.016)
  await shot("mood-"+str(n))
 check(moods.size()==6,"six distinct chapter lighting and particle palettes")
 app.switch_chapter(1)
 app.load_section(0)
 app.landscape.set_process(false)
 var scene=app.landscape
 var p=app.sim.p
 p.y-=45
 p.onGround=false
 p.vy=0
 scene.snap_actor()
 var heavy=false
 for i in range(50):
  var effects=step()
  if "land-heavy" in effects:
   heavy=true
   check(scene.squash>.3 and scene.kick_velocity.y>0 and scene.rings.size()>0,"heavy landing has squash, camera weight, floor shock and dust")
   await shot("landing")
 check(heavy and app.audio.cycle.has("land-hard"),"actual fast landing selects the existing heavy impact recording")
 var baseline=app.sim.freeze
 step("rx",.005)
 check(scene.render_hold>0 and app.sim.freeze>baseline,"dash visual hold uses the existing core freeze without changing it")
 for i in range(12): step("r",1.0/120)
 check(scene.observed.dash_hits>0 and scene.trails.size()>0,"actual dash-start emits an accented trail and launch pulse")
 await shot("dash")
 app.load_section(0)
 p=app.sim.p
 p.x=304
 p.y=35
 p.vy=25
 p.onGround=false
 p.facing=1
 scene.snap_actor()
 for i in range(16): step("r")
 check(scene.observed.wall_sparks>0 and scene.particles.any(func(q):return q.get("spark",false)),"actual sliding wall contact throws directional sparks")
 await shot("wall-slide")
 # Trigger a real thorn collision, then run the complete core death/respawn lifecycle.
 var placed=false
 for i in range(app.data.world.rooms.size()):
  var d=app.data.world.rooms[i]
  for r in range(d.map.size()):
   var c=d.map[r].find("^")
   if c>=0 and not placed:
    app.load_section(i)
    app.sim.p.x=c*8
    app.sim.p.y=r*8-4
    app.sim.p.onGround=false
    scene.snap_actor()
    scene.camera_float=Vector2(scene.actor.x-153,scene.actor.y-105)
    scene.camera_velocity=Vector2.ZERO
    placed=true
    break
  if placed: break
 for i in range(8):
  step()
  if scene.death_time>0: break
 check(scene.observed.deaths>0 and scene.death_time>0 and scene.rings.size()>0,"real death produces a break pulse and shards")
 await shot("death")
 var respawn=false
 for i in range(100):
  var effects=step()
  if "respawn" in effects:
   respawn=true
   check(scene.respawn_time>0 and scene.camera_velocity.length()<1,"respawn blooms at the checkpoint with a settled camera")
   await shot("respawn")
   break
 check(respawn,"core respawn timing still completes normally")
 app.switch_chapter(3)
 app.load_section(0)
 scene=app.landscape
 scene.set_process(false)
 var before=scene.before_tick()
 app.world.step({})
 app.world.claim_secret(app.world.data.secretRewards[0])
 var expected=fingerprint()
 scene.after_tick(before)
 scene._process(.18)
 check(scene.award_time>0 and scene.observed.awards==1 and fingerprint()==expected,"real heart reward triggers a presentation-only award burst")
 await shot("heart-bloom")
 for i in range(70): step()
 check(scene.award_time>1 and scene.award_time<2.5,"heart holds, arcs toward the HUD and settles")
 await shot("heart-flight")
 for i in range(110): step()
 check(scene.award_time<0 and scene.observed.awards==1,"heart award finishes once and clears its presentation")
 # The spring leads during travel and converges with no residual drift at rest.
 for i in range(30): step("r")
 check(scene.camera_lead.x>2,"camera leads motion")
 for i in range(360): step()
 check(abs(scene.camera_lead.x)<.01 and scene.camera_velocity.length()<.05 and scene.camera_kick.length()<.01,"camera and impact spring settle after release")
 scene.kick_velocity=Vector2.ZERO
 app.sim.flipped=true
 var inverted=fingerprint()
 scene.landing_speed=160
 scene.event_effect("land",scene.current_actor)
 check(scene.kick_velocity.y<0 and scene.particles[-1].v.y>0 and inverted==fingerprint(),"inverted landings send dust and camera weight away from the ceiling")
 app.sim.flipped=false
 var saved=fingerprint()
 scene.reduced_motion=true
 scene.event_effect("dash-start",scene.current_actor)
 scene.event_effect("death",scene.current_actor)
 scene._process(.016)
 check(scene.render_hold==0 and scene.camera_kick==Vector2.ZERO and not scene.wind.emitting and saved==fingerprint(),"reduced motion disables visual holds, camera impulses and ambient drift without changing simulation")
 check(not failed,"presentation leaves simulation untouched across "+str(comparisons)+" steps at varied render deltas")
 app.queue_free()
 await process_frame
 await create_timer(.15).timeout
 quit(1 if failed else 0)
