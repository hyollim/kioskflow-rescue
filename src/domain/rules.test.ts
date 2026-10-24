import { describe,expect,it } from 'vitest';
import { detectDifficulty,type RuleContext } from './rules';
import type { KioskEvent } from './events';
const c:RuleContext={mode:'C',step:'options',now:100_000,lastInteractionAt:80_000,enabled:true,dismissed:false,activeHelp:false,offerCount:0,lastOfferedAt:null};
const ev=(name:KioskEvent['name'],at=80_000,step:KioskEvent['step']='options'):KioskEvent=>({id:crypto.randomUUID(),sessionId:'s',mode:'C',source:'live',name,step,at});
describe('explainable contextual support policy',()=>{
 it('requires context beyond idle alone',()=>expect(detectDifficulty([], {...c,lastInteractionAt:0})).toBeNull());
 it('does not intervene on one ordinary action or brief pause',()=>{expect(detectDifficulty([ev('option_changed')],c)).toBeNull();expect(detectDifficulty([ev('invalid_action'),ev('invalid_action')],{...c,lastInteractionAt:80_001})).toBeNull()});
 it('offers at repeated error + idle threshold',()=>expect(detectDifficulty([ev('invalid_action'),ev('invalid_action')],c)).toBe('option_confusion'));
 it('handles repeated back navigation and idle',()=>expect(detectDifficulty([ev('back_navigation'),ev('back_navigation'),ev('back_navigation')],{...c,lastInteractionAt:85_000})).toBe('navigation_loop'));
 it('handles edits plus an error',()=>expect(detectDifficulty([ev('option_changed'),ev('option_changed'),ev('option_changed'),ev('invalid_action')],{...c,lastInteractionAt:100_000})).toBe('revision_loop'));
 it('handles long idle only with previous friction',()=>expect(detectDifficulty([ev('invalid_action',54_000)],{...c,lastInteractionAt:54_000})).toBe('idle_with_friction'));
 it.each(['A','B'] as const)('never automatically intervenes in %s',mode=>expect(detectDifficulty([ev('invalid_action'),ev('invalid_action')],{...c,mode})).toBeNull());
 it.each([{enabled:false},{dismissed:true},{activeHelp:true},{offerCount:2},{step:'start' as const},{step:'complete' as const},{lastOfferedAt:70_001}])('respects suppression %j',patch=>expect(detectDifficulty([ev('invalid_action'),ev('invalid_action')],{...c,...patch})).toBeNull());
 it('allows the cooldown boundary and max one earlier offer',()=>expect(detectDifficulty([ev('invalid_action'),ev('invalid_action')],{...c,lastOfferedAt:70_000,offerCount:1})).toBe('option_confusion'));
 it('ignores stale, future and other-screen signals',()=>{for(const events of [[ev('invalid_action',39_999),ev('invalid_action',39_999)],[ev('invalid_action',100_001),ev('invalid_action',100_001)],[ev('invalid_action',80_000,'menu'),ev('invalid_action',80_000,'menu')]])expect(detectDifficulty(events,c)).toBeNull()});
 it('prioritizes repeated errors before long idle',()=>expect(detectDifficulty([ev('invalid_action',54_000),ev('invalid_action',54_000)],{...c,lastInteractionAt:54_000})).toBe('option_confusion'));
});
