// Load the individually saved spare-room records into the ordinary authoring tools.
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {Rooms} from '../pcore-tape.mjs';
import {orderRecords} from './catalog.mjs';
const here=dirname(fileURLToPath(import.meta.url));
export const records=orderRecords(['base','fractured'].flatMap(side=>readdirSync(join(here,side)).filter(f=>f.endsWith('.json')).sort().map(f=>JSON.parse(readFileSync(join(here,side,f),'utf8')))));
for(const side of ['base','fractured']){
 const set=records.filter(x=>x.bank.side===side);
 if(set.length)Rooms.addPart({part:'spares',title:'Room Bank',chapters:[{id:'bank-'+side,name:side==='base'?'Base Spares':'Fractured Spares',bonus:true,rooms:set.map(x=>x.room)}],tapes:Object.fromEntries(set.filter(x=>x.tape?.length).map(x=>[x.room.id,x.tape]))});
}
