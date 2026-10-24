import { describe,expect,it } from 'vitest';
import { parseEvents,pruneEvents } from './storage';
import type { KioskEvent } from './events';
const event:KioskEvent={id:'e1',sessionId:'s1',mode:'C',source:'live',name:'session_started',step:'start',at:100};
describe('minimal browser storage',()=>{
 it.each([null,'bad','{}','[1,null]'])('safely ignores malformed data %s',raw=>expect(parseEvents(raw)).toEqual([]));
 it('reconstructs allowed fields only and strips arbitrary PII fields',()=>{expect(parseEvents(JSON.stringify([{...event,phone:'not-retained',card:'not-retained'}]))).toEqual([event])});
 it('rejects prototype event names and invalid timestamps',()=>{expect(parseEvents(JSON.stringify([{...event,name:'toString'},{...event,at:-1}]))).toEqual([])});
 it('drops oldest whole sessions before truncating a single giant session',()=>{const old=[event,{...event,id:'e2',name:'order_completed' as const}],newer=[{...event,id:'e3',sessionId:'s2'},{...event,id:'e4',sessionId:'s2'}];expect(pruneEvents([...old,...newer],3)).toEqual(newer)});
 it('preserves the session start when trimming a giant session',()=>{const events=[event,...Array.from({length:5},(_,i)=>({...event,id:`e${i+2}`,name:'step_entered' as const}))];const out=pruneEvents(events,3);expect(out).toHaveLength(3);expect(out[0].name).toBe('session_started');expect(out.at(-1)?.id).toBe('e6')});
 it('deduplicates IDs and validates cap',()=>{expect(pruneEvents([event,event])).toHaveLength(1);expect(()=>pruneEvents([event],1)).toThrow()});
});
