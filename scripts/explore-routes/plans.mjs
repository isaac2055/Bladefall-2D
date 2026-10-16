// Per-level plans for the Explore route builder: one file per stage in plans/ (plans/07.mjs is Frostfell), each
// exporting {steps, finish?, finishNote?}. The step kinds and the helpers a script step gets are in plan-kit.mjs.
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export {HELPERS} from './plan-kit.mjs';
const DIR=new URL('./plans/',import.meta.url);
export const PLANS={};
for(const f of readdirSync(fileURLToPath(DIR)).filter(f=>/^\d+\.mjs$/.test(f)).sort())
 PLANS[parseInt(f,10)]=(await import(new URL(f,DIR).href)).default;
