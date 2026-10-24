import type { Mode,Step } from './order';
export type EventSource='live'|'scenario'|'synthetic';
export type EventName='session_started'|'step_entered'|'invalid_action'|'back_navigation'|'option_changed'|'help_requested'|'help_offered'|'help_accepted'|'help_dismissed'|'staff_assistance_requested'|'order_completed'|'session_abandoned';
export interface KioskEvent {id:string;sessionId:string;mode:Mode;source:EventSource;name:EventName;step:Step;at:number;origin?:'auto'|'manual';offerId?:string;reason?:string}
export const eventLabels:Record<EventName,string>={session_started:'세션 시작',step_entered:'화면 진입',invalid_action:'필수 입력 오류',back_navigation:'이전 이동',option_changed:'옵션·주문 수정',help_requested:'도움 요청',help_offered:'자동 도움 제안',help_accepted:'제안 수락',help_dismissed:'제안 거절',staff_assistance_requested:'직원 호출 체험',order_completed:'주문 완료',session_abandoned:'주문 종료'};
