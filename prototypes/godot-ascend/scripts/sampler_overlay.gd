extends Control
## Prototype Garden, completion card and local records; gameplay stays in the native world.
var app
var clock_label:Label
var scrim:ColorRect
var panel:PanelContainer
var content:VBoxContainer
var showing_result=false
var panel_mode="result"
func _ready():
 mouse_filter=Control.MOUSE_FILTER_IGNORE
 clock_label=app.text(self,"",14,"#d8dfbc")
 clock_label.position=Vector2(690,14)
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
 if panel_mode=="result": app.set_paused(false)
 else:
  app.set_paused(true)
  app.focus_pause()
func prepare_panel(mode):
 panel_mode=mode
 app.set_paused(true)
 app.pause_panel.hide()
 scrim.show()
 clear_content()
func finish_panel():
 panel.size=Vector2(800,590)
 panel.show()
 app.focus_first.call_deferred(panel)
func open_garden():
 if not app.sampler.profile.completed.get("1",false): return
 prepare_panel("garden")
 var profile=app.sampler.profile
 app.text(content,"GARDEN",28,"#e4d5a7")
 var tabs=HBoxContainer.new();content.add_child(tabs)
 app.button(tabs,"Records",open_records,false)
 app.text(tabs,"♥ %d"%profile.heart_count(),21,"#c38aeb")
 var beds=HBoxContainer.new();beds.add_theme_constant_override("separation",12);content.add_child(beds)
 for n in [1,2,3]:
  var plant=profile.garden(n)
  var hearts=profile.heart_count(n)+profile.heart_count(n+20)+profile.heart_count(n+100)
  if not plant.root and not plant.top and not plant.core and hearts==0: continue
  var bed=VBoxContainer.new();bed.custom_minimum_size.x=235;beds.add_child(bed)
  app.text(bed,app.chapters[n].world.data.world.name,18)
  for part in ["root","top","core"]:
   if not plant[part]: continue
   var row=HBoxContainer.new();bed.add_child(row)
   var icon=preload("res://scripts/reward_icon.gd").new()
   icon.number=n;icon.root=true;icon.top=part=="top";icon.core_reward=part=="core";icon.owned=plant.core
   icon.shiny=plant.root_shiny if part=="root" else plant.flower_shiny if part=="top" else plant.core_shiny
   row.add_child(icon)
   app.text(row,({"root":"Root","top":"Flower","core":"Core"}[part])+(" ✦" if icon.shiny else ""),17)
  app.text(bed,"♥ %d"%hearts,19,"#c38aeb")
 app.button(content,"Back",close,false)
 finish_panel()
func open_records(number=0,mode="normal"):
 if not app.sampler.profile.completed.get("1",false): return
 if number==0: number=app.chapter_number
 prepare_panel("records")
 app.text(content,"LOCAL RECORDS",28,"#e4d5a7")
 var row=HBoxContainer.new();content.add_child(row)
 var picker=OptionButton.new()
 for chapter in app.CHAPTERS:
  if chapter!=4 and profile_visible(chapter): picker.add_item(app.world_label(chapter),chapter)
 picker.select(picker.get_item_index(number));row.add_child(picker)
 picker.item_selected.connect(func(index):open_records(picker.get_item_id(index),mode))
 app.button(row,"Normal" if mode=="shiny" else "Shiny",func():open_records(number,"normal" if mode=="shiny" else "shiny"),false)
 app.text(content,"Shiny runs" if mode=="shiny" else "All runs",16)
 var board=app.sampler.profile.board(number,mode)
 if board.is_empty(): app.text(content,"No times yet.",17)
 for i in range(board.size()):
  var result=board[i]
  app.text(content,"%d.   %s     %d deaths"%[i+1,app.sampler.profile.duration(result.frames),result.deaths],17)
 app.button(content,"Garden",open_garden,false)
 app.button(content,"Back",close,false)
 finish_panel()
func profile_visible(chapter): return app.sampler.profile.has_world(chapter)
func show_result():
 panel_mode="result"
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
 icon.top=plant.top and app.chapter_number not in [1,2,3]
 icon.shiny=plant.core_shiny if icon.core_reward else plant.root_shiny if app.chapter_number in [1,2,3] else plant.flower_shiny
 if icon.root or icon.top or icon.core_reward and icon.owned: content.add_child(icon)
 else: icon.free()
 app.text(content,r.award,20)
 if app.chapter_number==1 and r.get("first_clear",false):
  var hint=app.text(content,"",17,"#cadbab")
  hint.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
  hint.text="Garden & records is now in Settings."
 if app.chapter_number==3 and app.sampler.profile.all_bases_clear(): app.text(content,"Fractured worlds are now open.",17,"#cadbab")
 var destinations=[]
 if app.chapter_number in [1,2]: destinations.append(app.chapter_number+1)
 if app.chapter_number in [1,2,3]:
  if app.sampler.profile.available(app.chapter_number+20): destinations.append(app.chapter_number+20)
  if app.sampler.profile.core_open(app.chapter_number): destinations.append(app.chapter_number+100)
 if app.chapter_number in [21,22,23] and app.sampler.profile.core_open(app.chapter_number-20): destinations.append(app.chapter_number+80)
 for destination in destinations:
  app.button(content,"Continue to "+app.world_label(destination),func():
   panel.hide();scrim.hide();app.travel_to_world(destination),false)

 app.button(content,"Garden and leaderboard",open_garden,false)
 app.button(content,"Replay world",func():
  showing_result=false
  panel.hide()
  scrim.hide()
  app.restart_world(),false)
 app.button(content,"Continue exploring",close,false)
 panel.size=Vector2(800,590)
 panel.show()
 app.focus_first.call_deferred(panel)
