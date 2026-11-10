extends "res://scripts/challenge_landscape.gd"
## The approved B/C-side machinery, with Felix's familiar small body and a darker night palette.
const FelixBody=preload("res://scripts/felix_body.gd")
var body=FelixBody.new()
var riding=false
var gift_pulse=0.0
var felix_story=null
func _ready():
 super._ready()
 var night=CanvasModulate.new()
 night.color=Color(.72,.76,.9)
 add_child(night)
func draw_knight(pose=null,at=Vector2(INF,INF),phase_override=-1.0):
 if felix_story==null: return
 body.draw(self,felix_story.gifts)
