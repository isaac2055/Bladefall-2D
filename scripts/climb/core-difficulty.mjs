// Requested extra crumble grace, on top of the native 24-frame crumble timer.
// Batch 1: 1s; batch 2: .66s; batch 3: .33s; batch 4: no extra grace.
export function coreCrumbleGrace(core){
 if(!Number.isInteger(core)||core<1||core>20)throw new RangeError('Core index must be 1–20');
 return core<=5?60:core<=10?40:core<=15?20:0;
}
