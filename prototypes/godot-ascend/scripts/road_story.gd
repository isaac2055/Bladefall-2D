extends Control
## In-world establishing/ending shots. Puzzle state and physics stay frozen during the shot.
var app
var phase=""
var age=0.0
var ending_ready=false
var seen_this_run={}
var origin=Vector2.ZERO
var focus=Vector2.ZERO
var camera_from=Vector2.ZERO
var caption:Label
var caption_panel:PanelContainer
func _ready():
 mouse_filter=Control.MOUSE_FILTER_IGNORE
 set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 caption_panel=PanelContainer.new()
 caption_panel.position=Vector2(260,692)
 caption_panel.size=Vector2(760,62)
 caption_panel.add_theme_stylebox_override("panel",app.style("#102029e8","#9b956d",6))
 add_child(caption_panel)
 caption=app.text(caption_panel,"",20,"#e6d4a8")
 caption.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 caption.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
 caption.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 hide()
func active(): return phase!=""
func check_begin():
 if active() or app.watch or not app.game_started or not app.sampler.result.is_empty(): return false
 var route=app.world.data.world.get("campaignWorkshop",{})
 if route.get("geometry",false): return false
 if route.is_empty() or app.world.active_id!=route.entry or not app.sim.p.onGround: return false
 if not app.sampler.ride.is_empty(): return false
 var key="lift-%d"%app.chapter_number
 if seen_this_run.has(key): return false
 if app.sampler.profile.story_seen.get(key,false) and not app.dev_mode: return false
 seen_this_run[key]=true
 begin("reveal")
 return true
func begin(kind):
 phase=kind;age=0
 if kind=="reveal":
  if app.sampler.ride.get("phase","")!="reveal":
   app.sampler.begin_reveal(app.world)
   app.sampler.ride.reveal_duration=1.0 if app.landscape.reduced_motion else 4.2
  age=float(app.sampler.ride.get("reveal_age",0))
 origin=app.sampler.ride.from if kind=="reveal" else app.world.position()
 focus=origin+Vector2(72,-30)
 camera_from=app.landscape.camera_float
 var walk=0.0
 if kind=="ending":
  for step in range(1,21):
   var foot=origin+Vector2(step+4,app.sim.p.h)
   if app.world.tile_global(floori(foot.x/8),floori(foot.y/8)) not in [1,2]: break
   if app.world.tile_global(floori(foot.x/8),floori((foot.y-8)/8))!=0: break
   walk=step
 app.landscape.story={"phase":phase,"age":age,"origin":origin,"focus":focus,"walk":walk}
 for node in app.hud_nodes: node.hide()
 app.sampler_overlay.clock_label.hide()
 app.subtitle_panel.hide()
 caption.text=({1:"The watch road is shut. The signal still carries.",2:"The roots keep the ground. The rangers kept another way.",3:"The freight road is closed. The inspection line still runs."}.get(app.sampler.profile.home(app.chapter_number),"The old road gives way to the lantern route.") if kind=="reveal" else {1:"Beyond the watch, the woods are waiting.",2:"Beyond the last bough, the Causeway bells are calling.",3:"Beyond the iron road, another light remains."}.get(app.sampler.profile.home(app.chapter_number),"The road remembers."))
 caption_panel.modulate.a=0
 app.landscape.set_process(true)
 app.audio.set_paused(false)
 show()
 move_to_front()
func begin_ending():
 if ending_ready or active(): return
 # finish() has already persisted rewards/unlocks, before this presentation starts.
 begin("ending")
 app.maybe_autosave(true)
func physics_tick(delta):
 if not active(): return check_begin()
 if app.paused: return true
 var old_age=age
 age+=delta
 if phase=="reveal":
  app.sampler.ride.reveal_age=age
  var cue=.55 if app.sampler.profile.home(app.chapter_number)==1 else .85
  if old_age<cue and age>=cue:
   app.audio.effect({1:"bell",2:"lantern",3:"lever"}.get(app.sampler.profile.home(app.chapter_number),"lever"),.6)
 if phase=="ending": app.sampler.award_age=age
 app.landscape.story.age=age
 var duration=float(app.sampler.ride.get("reveal_duration",4.2)) if phase=="reveal" else 1.0 if app.landscape.reduced_motion else 4.8
 var pan=smoothstep(0,1,minf(age/2.2,1))
 if app.landscape.reduced_motion: pan=0
 app.landscape.story.camera=camera_from.lerp(origin-Vector2(112,124),pan)
 caption_panel.modulate.a=smoothstep(.3,1.1,age)*(1-smoothstep(duration-.65,duration,age))
 queue_redraw()
 if age>=duration:
  if phase=="reveal":
   app.sampler.profile.story_seen["lift-%d"%app.chapter_number]=true
   app.sampler.profile.save_profile()
   # The very same ride and drawing now accelerate from the dock at rest.
   app.sampler.ride.camera_handoff_target=app.landscape.story.camera
   app.sampler.ride.phase="travel"
   app.landscape.story.phase="travel"
   phase=""
   hide()
   app.apply_player_visibility()
   app.maybe_autosave(true)
  else:
   ending_ready=true
   # Keep the final camera/lantern tableau under the card; it fades over the same shot.
   phase="";caption_panel.hide();hide()
   app.apply_player_visibility()
   app.sampler_overlay.showing_result=true
   app.sampler_overlay.show_result()
 return true
func cancel(reset=true):
 if reset:
  seen_this_run.clear()
  if app!=null and app.sampler!=null and app.sampler.ride.get("phase","")=="reveal": app.sampler.ride={}
 phase="";age=0;ending_ready=false
 if app!=null and app.landscape!=null: app.landscape.story={}
 hide()
 if app!=null and app.is_node_ready(): app.apply_player_visibility()
 if caption_panel!=null: caption_panel.show()
func _draw():
 if not active(): return
 var duration=float(app.sampler.ride.get("reveal_duration",4.2)) if phase=="reveal" else 1.0 if app.landscape.reduced_motion else 4.8
 var bars=smoothstep(0,.4,age)
 if phase=="reveal": bars*=1-smoothstep(duration-.5,duration,age)
 draw_rect(Rect2(0,0,1280,64*bars),Color("#070e14"))
 draw_rect(Rect2(0,832-64*bars,1280,64*bars),Color("#070e14"))
 if phase=="ending": draw_rect(Rect2(0,0,1280,832),Color(.02,.04,.06,.7*smoothstep(3.5,4.8,age)))
