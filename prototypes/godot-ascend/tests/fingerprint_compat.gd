extends SceneTree
## Golden 4.5 content IDs protect native scene checks and existing save signatures.
const Codec=preload("res://authoring/codec.gd")
const Authoring=preload("res://scripts/authoring_data.gd")
const World=preload("res://scripts/world.gd")
const SIGNATURES={
 1:"311923f243c27e7ebc700b98a5ca8faf33fce50448638cba447af8328e0ef6da",
 2:"820b7cfbd21b08b625d995f05abae4a122562b783311cc6737d0983465338db6",
 3:"bf81c36cc49ebe50cc6da64cab4a1367eba5c3c2ac7c9344b50bc016e9fda70e",
 4:"91660115cd67dea2fa5a419a2b197cf3fa2a88090156c82c30a48b777ab94b3f",
 21:"4f2dcb189e49656c0af29ff622c4957eeb39b2971f926c20538af42e9ebd4bd6",
 22:"0acaa1b0e24267023462bb30133f3d2e1a54f83e6836f9e0d30f937d5bfc95f4",
 23:"7a0ac43c88274583c8c6178c1a2b5804040a051b91a978694f0ffe7fafb68be2",
 101:"4f5a33f2c6a2e490dc1603964ff8b4a0268cbf0fdad4c6cab8168b1aa62ac18b",
 102:"b5364207cd9b9a68ab891ba2e6e6de423131a94d4951e8aa6ca157ec67a4fa85",
 103:"eaf5d820fee07c308157654f39a397ddcd67489eee93d07e4cd11e1fe9d57e07"}
var failures=0
func check(ok,label):
 print("PASS " if ok else "FAIL ",label)
 if not ok: failures+=1
func _initialize():
 check(Codec.fingerprint_json({"x":0.65})=='{"x":0.650000000000000022}',"legacy full-precision float spelling is stable")
 var text_fixture={"text":"numbers 0.65 and 1e20 stay quoted; \"0.65\"", "zero":0.0}
 check(Codec.fingerprint_json(text_fixture)==JSON.stringify(text_fixture,"",true,true),"quoted numbers and escaped quotes stay untouched")
 for n in SIGNATURES:
  var source=JSON.parse_string(FileAccess.get_file_as_string("res://data/world%d.json"%n))
  var baseline=Authoring.baseline(source)
  var packed=load(source.get("nativeScene","res://levels/world%d.tscn"%n)).instantiate()
  check(Codec.fingerprint_json(baseline).sha256_text()==packed.source_fingerprint,"native scene retains its 4.5 fingerprint: "+str(n))
  packed.free()
  var world=World.new(source)
  check(world.content_signature==SIGNATURES[n],"compiled world and checkpoint signature stays unchanged: "+str(n))
  world.shutdown()
 print("FINGERPRINT COMPAT FAILURES ",failures)
 quit(1 if failures else 0)
