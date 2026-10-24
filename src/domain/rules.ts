import type { Mode, Step } from "./order";
import type { KioskEvent } from "./events";
export interface RuleContext {
  mode: Mode;
  step: Step;
  now: number;
  lastInteractionAt: number;
  enabled: boolean;
  dismissed: boolean;
  activeHelp: boolean;
  offerCount: number;
  lastOfferedAt: number | null;
}
export type RuleReason =
  | "option_confusion"
  | "navigation_loop"
  | "revision_loop"
  | "idle_with_friction";
export const RULES = {
  windowMs: 60_000,
  cooldownMs: 30_000,
  maxOffers: 2,
  errorCount: 2,
  backCount: 3,
  editCount: 3,
  errorIdleMs: 20_000,
  backIdleMs: 15_000,
  longIdleMs: 45_000,
} as const;
export function detectDifficulty(
  events: KioskEvent[],
  c: RuleContext,
): RuleReason | null {
  if (
    c.mode !== "C" ||
    !c.enabled ||
    c.dismissed ||
    c.activeHelp ||
    c.offerCount >= RULES.maxOffers ||
    c.step === "start" ||
    c.step === "complete"
  )
    return null;
  if (c.lastOfferedAt !== null && c.now - c.lastOfferedAt < RULES.cooldownMs)
    return null;
  const recent = events.filter(
    (e) => e.step === c.step && e.at <= c.now && e.at >= c.now - RULES.windowMs,
  );
  const errors = recent.filter((e) => e.name === "invalid_action").length,
    backs = recent.filter((e) => e.name === "back_navigation").length,
    edits = recent.filter((e) => e.name === "option_changed").length,
    idle = Math.max(0, c.now - c.lastInteractionAt);
  if (errors >= RULES.errorCount && idle >= RULES.errorIdleMs)
    return "option_confusion";
  if (backs >= RULES.backCount && idle >= RULES.backIdleMs)
    return "navigation_loop";
  if (edits >= RULES.editCount && errors >= 1) return "revision_loop";
  if (idle >= RULES.longIdleMs && (errors >= 1 || backs >= 1 || edits >= 1))
    return "idle_with_friction";
  return null;
}
export const reasonLabels: Record<RuleReason, string> = {
  option_confusion: "필수 입력 오류가 반복된 뒤 잠시 조작이 없었어요.",
  navigation_loop: "같은 화면으로 여러 번 돌아온 뒤 조작이 멈췄어요.",
  revision_loop: "옵션 변경과 입력 오류가 함께 반복됐어요.",
  idle_with_friction: "앞선 조작의 어려움과 긴 대기가 함께 관측됐어요.",
};
