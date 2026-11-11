extends SceneTree
## Launch with a graphical Godot and --dev-graphics, followed by room arguments.

const Lab=preload("res://scripts/graphics_lab.gd")
const STEP=1.0/60.0
const CASES=[
 ["Original",0,{}],
 ["Clear",1,{}],
 ["Storm",9,{}],
 ["Storm without clouds",9,{"cloud_strength":0}],
 ["Storm without rain",9,{"weather_strength":0}],
 ["Storm without post",9,{"post":false}],
 ["Storm without decorative shadows",9,{"shadows":false}],
 ["Storm Half",9,{"scale":2}],
]
const STORM=2

var args=OS.get_cmdline_user_args()
var felix=ResourceLoader.exists("res://felix.tscn")
var anchor:Dictionary={}
var out=""
var failure=""

func _initialize():
 run.call_deferred()

func number_arg(key:String, fallback:int, minimum:int, maximum:int)->int:
 var prefix="--"+key+"="
 for arg in args:
  if not arg.begins_with(prefix): continue
  var value=arg.trim_prefix(prefix)
  if not value.is_valid_int() or int(value)<minimum or int(value)>maximum:
   failure="%s must be an integer from %d to %d."%[prefix,minimum,maximum]
   return fallback
  return int(value)
 return fallback

func run():
 if DisplayServer.get_name()=="headless" or not args.has("--dev-graphics"):
  stop("Use a graphical Godot and pass --dev-graphics after --.")
  return
 var out_index=args.find("--benchmark-out")
 if out_index<0 or out_index+1>=args.size():
  stop("Pass --benchmark-out followed by an absolute output directory.")
  return
 out=args[out_index+1]
 if not out.is_absolute_path() or DirAccess.make_dir_recursive_absolute(out)!=OK:
  stop("Could not create the absolute output directory.")
  return
 var samples=number_arg("benchmark-frames",90,30,1200)
 var warmup=number_arg("benchmark-warmup",60,60,600)
 var repeats=number_arg("benchmark-repeats",3,2,8)
 if not failure.is_empty():
  stop(failure)
  return
 var scene:PackedScene=load("res://felix.tscn" if felix else "res://main.tscn")
 DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 Engine.max_fps=0
 var rows:Array=[]
 for entry in CASES: rows.append([])
 for run_index in range(repeats):
  # Alternate case order to expose warm-cache and thermal drift.
  for index in range(CASES.size()):
   var case_index=index if run_index%2==0 else CASES.size()-1-index
   var data=await measure(scene,case_index,warmup,samples,run_index==0)
   if data.is_empty():
    stop(failure)
    return
   rows[case_index].append(data)
   print("PASS %d/%d · %s · %.2f ms median"%[run_index+1,repeats,CASES[case_index][0],data.wall_frame_ms.median])
 var summary=[]
 print("Look                              Median ms    p95 ms   Draws   Δ vs Storm")
 for case_index in range(CASES.size()):
  var runs:Array=rows[case_index]
  var medians=[]
  var tails=[]
  var draws=[]
  var deltas=[]
  for i in range(repeats):
   var row:Dictionary=runs[i]
   medians.append(row.wall_frame_ms.median)
   tails.append(row.wall_frame_ms.p95)
   draws.append(row.draw_calls.median)
   deltas.append(row.wall_frame_ms.median-rows[STORM][i].wall_frame_ms.median)
  var stats={"name":CASES[case_index][0],"median_ms":median(medians),"median_p95_ms":median(tails),"median_draw_calls":median(draws),"paired_median_delta_ms":median(deltas),"runs":runs}
  summary.append(stats)
  print("%-33s %9.2f %9.2f %7.0f %+12.2f"%[stats.name,stats.median_ms,stats.median_p95_ms,stats.median_draw_calls,stats.paired_median_delta_ms])
 var report={
  "game":"Felix" if felix else "Bladefall",
  "godot":Engine.get_version_info().string,
  "adapter":RenderingServer.get_video_adapter_name(),
  "rendering_driver":RenderingServer.get_current_rendering_driver_name(),
  "vsync_mode":DisplayServer.window_get_vsync_mode(),
  "launch_args":Array(args),
  "anchor":anchor,
  "sample_frames":samples,
  "warmup_frames":warmup,
  "repeats":repeats,
  "cases":summary,
 }
 var path=out.path_join("graphics-benchmark.json")
 var file=FileAccess.open(path,FileAccess.WRITE)
 if file==null:
  stop("Could not write "+path)
  return
 file.store_string(JSON.stringify(report,"  ")+"\n")
 file.close()
 print("Report: ",path)
 quit()

func measure(scene:PackedScene,case_index:int,warmup:int,samples:int,capture:bool)->Dictionary:
 var game=scene.instantiate()
 if felix: game.developer_mode=true
 else: game.test_mode=true
 root.add_child(game)
 game.set_physics_process(false)
 game.set_process(false)
 game.set_paused(false)
 var view=game.view if felix else game.landscape
 view.set_process(false)
 var lab=game.graphics_lab
 lab.cli_override=true
 var entry:Array=CASES[case_index]
 lab.select_preset(entry[1],false)
 # Match internal resolution even in rooms where Auto uses Half.
 lab.options.scale=1
 for key in entry[2]:
  lab.options[key]=entry[2][key]
 lab.options.preset=Lab.CUSTOM
 game.apply_graphics_lab()
 var container=game.viewport.get_parent()
 var expected_shrink=2 if entry[2].get("scale",1)==2 else 1
 if container.stretch_shrink!=expected_shrink:
  failure="The requested render scale was not applied for "+entry[0]+"."
  game.queue_free()
  return {}
 var frame_ms=[]
 var draw_calls=[]
 var cpu={"background":[],"foreground":[],"presentation":[]}
 var last=0
 for index in range(warmup+samples):
  await process_frame
  if game.paused: game.set_paused(false)
  game._process(STEP)
  view._process(STEP)
  await RenderingServer.frame_post_draw
  var now=Time.get_ticks_usec()
  if index==warmup-1 and not check_anchor(game,view):
   game.queue_free()
   return {}
  if index>=warmup:
   frame_ms.append((now-last)/1000.0)
   draw_calls.append(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME))
   for key in cpu: cpu[key].append(view.draw_cpu_us[key])
  last=now
 if not check_anchor(game,view) or median(draw_calls)<=0:
  if failure.is_empty(): failure="The renderer reported no draw calls."
  game.queue_free()
  return {}
 if capture:
  var path=out.path_join("%02d-%s.png"%[case_index+1,entry[0].to_lower().replace(" ","-")])
  if root.get_texture().get_image().save_png(path)!=OK:
   failure="Could not capture "+path
   game.queue_free()
   return {}
 for key in cpu: cpu[key]=Lab.timing_stats(cpu[key])
 var data={
  "graphics":lab.diagnostics(container),
  "render_size":str(game.viewport.size),
  "wall_frame_ms":Lab.timing_stats(frame_ms),
  "draw_calls":Lab.timing_stats(draw_calls),
  "draw_cpu_us":cpu,
 }
 game.queue_free()
 await process_frame
 return data

func check_anchor(game,view)->bool:
 var state={
  "room":game.world.active_id,
  "position":str(game.world.position()),
  "camera":str(view.camera),
  "checkpoint":game.world.checkpoint_id,
  "world_frame":game.world.frames,
  "window_size":str(root.size),
 }
 if anchor.is_empty(): anchor=state
 if state==anchor: return true
 failure="The benchmark scene moved: expected %s, got %s."%[anchor,state]
 return false

func median(values:Array)->float:
 var sorted=values.duplicate()
 sorted.sort()
 var middle=floori(sorted.size()*0.5)
 return sorted[middle] if sorted.size()%2 else (sorted[middle-1]+sorted[middle])*0.5

func stop(message:String):
 printerr("Graphics benchmark: ",message)
 quit(1)
