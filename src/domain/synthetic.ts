import type { KioskEvent,EventName } from './events';
import type { Mode,Step } from './order';
export function createSyntheticEvents():KioskEvent[]{
 const data:KioskEvent[]=[];let n=0;const base=Date.parse('2026-10-24T00:00:00+09:00');
 for(const mode of ['A','B','C'] as Mode[]){for(let i=0;i<4;i++){const sessionId=`synthetic-${mode}-${i}`,start=base+(n++)*180_000;let event=0;const push=(name:EventName,seconds:number,step:Step,extra:Partial<KioskEvent>={})=>data.push({id:`${sessionId}-${event++}`,sessionId,mode,source:'synthetic',name,at:start+seconds*1000,step,...extra});push('session_started',0,'start');push('step_entered',2,'menu');push('step_entered',18,'options');
 if(mode==='B'&&i<2){push('help_requested',30,'options',{origin:'manual'});if(i===1)push('staff_assistance_requested',40,'options',{origin:'manual'})}
 if(mode==='C'&&i<3){const offerId=`offer-${mode}-${i}`;push('invalid_action',22,'options');push('invalid_action',24,'options');push('help_offered',45,'options',{origin:'auto',offerId,reason:'option_confusion'});push(i===0?'help_accepted':'help_dismissed',47,'options',{origin:'auto',offerId})}
 const abandon=i===1;const duration=mode==='A'?[80,60,100,120][i]:mode==='B'?[90,95,85,110][i]:[110,95,65,100][i];if(abandon){push('session_abandoned',duration,'options',{reason:'synthetic_exit'})}else{push('step_entered',duration-12,'cart');push('step_entered',duration-8,'review');push('step_entered',duration-4,'payment');push('step_entered',duration,'complete');push('order_completed',duration,'complete')}
 }}return data;
}
