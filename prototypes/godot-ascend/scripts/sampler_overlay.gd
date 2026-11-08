extends Control
## Prototype Garden, completion card and local records; gameplay stays in the native world.
var app
var clock_label:Label
var scrim:ColorRect
var panel:PanelContainer
var content:VBoxContainer
var showing_result=false
func _ready():
 mouse_filter=Control.MOUSE_FILTER_IGNORE
 clock_label=app.text(self,"",14,"#d8dfbc")
 clock_label.position=Vector2(690,14)
 var garden=app.button(self,"Garden / Records",open_garden,false)
 garden.position=Vector2(1040,744)
 scrim=ColorRect.new()
 scrim.color=Color(0.02,0.04,0.06,.7)
 scrim.size=Vector2(1280,832)
 add_child(scrim)
 scrim.hide()
 panel=PanelContainer.new()
 panel.position=Vector2(240,115)
 panel.size=Vector2(800,590)
 panel.add_theme_stylebox_override("panel",app.style("#10232bf5","#9daf83",10))
 add_child(panel)
 var scroll=ScrollContainer.new()
 scroll.horizontal_scroll_mode=ScrollContainer.SCROLL_MODE_DISABLED
 scroll.custom_minimum_size=Vector2(775,570)
 panel.add_child(scroll)
 content=VBoxContainer.new()
 content.custom_minimum_size.x=740
 content.size_flags_horizontal=Control.SIZE_EXPAND_FILL
 content.add_theme_constant_override("separation",12)
 scroll.add_child(content)
 panel.hide()
func clear_content():
 for node in content.get_children():
  content.remove_child(node)
  node.queue_free()
func _process(_delta):
 if app.sampler==null: return
 var run=app.sampler.profile.run
 if run.is_empty(): return
 clock_label.text=app.sampler.profile.duration(run.frames)+(" · SHINY" if run.carrying else " · PRACTICE" if not run.eligible else "")
 if not app.sampler.result.is_empty() and not showing_result:
  showing_result=true
  show_result()
func close():
 scrim.hide()
 panel.hide()
 app.set_paused(false)
func open_garden():
 app.set_paused(true)
 app.pause_panel.hide()
 scrim.show()
 clear_content()
 app.text(content,"THE GARDEN",28,"#e4d5a7")
 var profile=app.sampler.profile
 var beds=HBoxContainer.new()
 beds.add_theme_constant_override("separation",12)
 content.add_child(beds)
 for n in [1,2,3]:
  var p=profile.garden(n)
  var bed=VBoxContainer.new()
  bed.custom_minimum_size.x=235
  beds.add_child(bed)
  var icons=HBoxContainer.new()
  bed.add_child(icons)
  for is_core in [false,true]:
   var icon=preload("res://scripts/reward_icon.gd").new()
   icon.number=n
   icon.core_reward=is_core
   icon.owned=p.core
   icon.root=p.root
   icon.top=p.top
   icon.shiny=p.core_shiny if is_core else p.flower_shiny
   icons.add_child(icon)
  app.text(bed,profile.PLANTS[n-1],18)
  app.text(bed,("Root ✓" if p.root else "Root · missing")+"  /  "+("Crown ✓" if p.top else "Crown · missing"),14)
  app.text(bed,"✦ Shiny plant" if p.flower_shiny else "Plant · normal" if p.root and p.top else "Plant · incomplete",14)
  app.text(bed,profile.CORES[n-1]+(" ✦" if p.core_shiny else " ✓" if p.core else " · missing"),16)
  app.text(bed,"Core unlocked" if profile.core_open(n) else "Core locked",14)
 app.text(content,"LOCAL RECORDS · "+app.data.world.name,22,"#e4d5a7")
 for mode in ["normal","shiny"]:
  app.text(content,mode.capitalize()+" · fastest 20 · deaths break equal times",15)
  var board=profile.board(app.chapter_number,mode)
  if board.is_empty(): app.text(content,"No completed runs yet.",14)
  for i in range(board.size()):
   var r=board[i]
   app.text(content,"%d.   %s     %d deaths     %s"%[i+1,profile.duration(r.frames),r.deaths,r.date.substr(0,10)],15)
 var instructions=app.text(content,"",15)
 instructions.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
 instructions.text="For a shiny, backtrack to the start patch on a replay and carry your reward through the whole world. Death or Retry restarts the world."
 if profile.save_error!="": app.text(content,profile.save_error,15,"#efa2a2")
 app.button(content,"Back to game",close,false)
 panel.size=Vector2(800,590)
 panel.show()
func show_result():
 app.set_paused(true)
 app.pause_panel.hide()
 scrim.show()
 app.landscape.set_process(true)
 clear_content()
 var r=app.sampler.result
 app.text(content,"WORLD COMPLETE",30,"#e4d5a7")
 app.text(content,app.data.world.name,23)
 app.text(content,"Time   "+app.sampler.profile.duration(r.frames)+"     ·     %d deaths"%r.deaths,24)
 var icon=preload("res://scripts/reward_icon.gd").new()
 icon.number=app.sampler.profile.home(app.chapter_number)
 icon.core_reward=app.chapter_number>=101
 var plant=app.sampler.profile.garden(icon.number)
 icon.owned=plant.core
 icon.root=plant.root
 icon.top=plant.top
 icon.shiny=plant.core_shiny if icon.core_reward else plant.flower_shiny
 content.add_child(icon)
 app.text(content,r.award if r.award!="" else "Journey recorded · clear without deaths for the flower root",20)
 app.text(content,"Saved to this Mac's "+r.mode+" leaderboard." if r.saved else app.sampler.profile.save_error,16)
 app.button(content,"Garden and leaderboard",open_garden,false)
 app.button(content,"Replay world",func():
  showing_result=false
  panel.hide()
  scrim.hide()
  app.restart_world(),false)
 app.button(content,"Continue exploring",close,false)
 panel.size=Vector2(800,590)
 panel.show()
