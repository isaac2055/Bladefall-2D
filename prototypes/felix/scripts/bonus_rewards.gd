extends RefCounted
## Optional side challenges, never the affixed main-road puzzles.
static func prepare(data):
 var n=int(data.world.n)
 if n!=1: return
 if not data.has("secretRewards"): data.secretRewards=[]
 if not data.secretRewards.any(func(r):return r.id=="secret-1"):
  data.secretRewards.append({"id":"secret-1","room":"cl1-secret-r2","title":"Hang Time","name":"Purple Heart","x":196,"y":20,"color":"#ba82e6"})
 if not data.has("branchRewards"): data.branchRewards=[]
 if not data.branchRewards.any(func(r):return r.id=="rowan-bonus"):
  data.branchRewards.append({"id":"rowan-bonus","kind":"quest","host":"cl1-o1-camp","room":"cl1-o1-q-tower","rooms":["cl1-o1-q-yard","cl1-o1-q-tower"],"title":"The Old Bell Tower","name":"Purple Heart","x":148,"y":12,"color":"#ba82e6"})
