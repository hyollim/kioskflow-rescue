import { useEffect, useRef, useState } from "react";
import type { Mode, Step } from "../domain/order";
import type { EventName, EventSource, KioskEvent } from "../domain/events";
import {
  detectDifficulty,
  reasonLabels,
  type RuleReason,
} from "../domain/rules";
interface Help {
  stage: "offer" | "guide";
  origin: "auto" | "manual";
  offerId?: string;
  reason?: RuleReason;
}
export function useRescue(mode: Mode, onEvent?: (e: KioskEvent) => void) {
  const callback = useRef(onEvent);
  callback.current = onEvent;
  const session = useRef<{
      id: string;
      mode: Mode;
      source: EventSource;
      active: boolean;
    } | null>(null),
    history = useRef<KioskEvent[]>([]),
    currentStep = useRef<Step>("start"),
    offset = useRef(0),
    lastInteraction = useRef(0);
  const policy = useRef({
    enabled: true,
    dismissed: false,
    offerCount: 0,
    lastOfferedAt: null as number | null,
  });
  const [help, setHelp] = useState<Help | null>(null),
    helpRef = useRef<Help | null>(null);
  const [enabled, setEnabledState] = useState(true),
    [dismissed, setDismissed] = useState(false),
    [source, setSource] = useState<EventSource>("live");
  const [staffNotice, setStaffNotice] = useState(false);
  const now = () => Date.now() + offset.current;
  function show(h: Help | null) {
    helpRef.current = h;
    setHelp(h);
  }
  function emit(
    name: EventName,
    extra: Partial<Pick<KioskEvent, "origin" | "offerId" | "reason">> = {},
  ) {
    const s = session.current;
    if (!s) return;
    const e: KioskEvent = {
      id: crypto.randomUUID(),
      sessionId: s.id,
      mode: s.mode,
      source: s.source,
      name,
      step: currentStep.current,
      at: now(),
      ...extra,
    };
    history.current.push(e);
    callback.current?.(e);
  }
  function check() {
    const s = session.current;
    if (!s?.active) return;
    const reason = detectDifficulty(history.current, {
      ...policy.current,
      mode: s.mode,
      step: currentStep.current,
      now: now(),
      lastInteractionAt: lastInteraction.current,
      activeHelp: helpRef.current !== null,
    });
    if (reason) {
      const offerId = crypto.randomUUID();
      policy.current.offerCount++;
      policy.current.lastOfferedAt = now();
      emit("help_offered", { origin: "auto", offerId, reason });
      show({ stage: "offer", origin: "auto", offerId, reason });
    }
  }
  function begin(nextSource: EventSource = "live") {
    session.current = {
      id: crypto.randomUUID(),
      mode,
      source: nextSource,
      active: true,
    };
    history.current = [];
    offset.current = 0;
    currentStep.current = "start";
    lastInteraction.current = now();
    policy.current = {
      enabled: policy.current.enabled,
      dismissed: false,
      offerCount: 0,
      lastOfferedAt: null,
    };
    setDismissed(false);
    setSource(nextSource);
    setStaffNotice(false);
    show(null);
    emit("session_started");
  }
  function enter(step: Step) {
    if (step !== "start" && !session.current?.active && step !== "complete")
      begin();
    currentStep.current = step;
    lastInteraction.current = now();
    if (session.current?.active) {
      emit("step_entered");
      if (step === "complete") {
        emit("order_completed");
        session.current.active = false;
        show(null);
      }
    }
  }
  function record(name: EventName, reason?: string) {
    if (!session.current?.active) return;
    lastInteraction.current = now();
    emit(name, reason ? { reason } : {});
    check();
  }
  function reset(reason = "user_reset") {
    if (session.current?.active) {
      emit("session_abandoned", { reason });
      session.current.active = false;
    }
    session.current = null;
    history.current = [];
    currentStep.current = "start";
    offset.current = 0;
    policy.current = {
      enabled: policy.current.enabled,
      dismissed: false,
      offerCount: 0,
      lastOfferedAt: null,
    };
    show(null);
    setDismissed(false);
    setStaffNotice(false);
    setSource("live");
  }
  function request() {
    if (mode === "A" || !session.current?.active) return;
    lastInteraction.current = now();
    emit("help_requested", { origin: "manual" });
    if (helpRef.current?.stage === "offer") accept();
    else show({ stage: "guide", origin: "manual" });
    setStaffNotice(false);
  }
  function accept() {
    const h = helpRef.current;
    if (!h || h.stage !== "offer") return;
    emit("help_accepted", { origin: "auto", offerId: h.offerId });
    lastInteraction.current = now();
    show({ ...h, stage: "guide" });
  }
  function decline() {
    const h = helpRef.current;
    if (h?.stage === "offer")
      emit("help_dismissed", { origin: "auto", offerId: h.offerId });
    policy.current.dismissed = true;
    setDismissed(true);
    show(null);
    lastInteraction.current = now();
  }
  function close() {
    show(null);
    lastInteraction.current = now();
  }
  function staff() {
    if (!helpRef.current || !session.current?.active) return;
    emit("staff_assistance_requested", {
      origin: helpRef.current.origin,
      offerId: helpRef.current.offerId,
    });
    setStaffNotice(true);
    lastInteraction.current = now();
  }
  function setEnabled(value: boolean) {
    policy.current.enabled = value;
    setEnabledState(value);
    if (!value && helpRef.current?.stage === "offer") decline();
  }
  function advance(ms: number) {
    offset.current += ms;
    check();
  }
  function touch() {
    lastInteraction.current = now();
  }
  useEffect(() => {
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, []);
  return {
    help,
    source,
    enabled,
    dismissed,
    staffNotice,
    begin,
    enter,
    record,
    reset,
    request,
    accept,
    decline,
    close,
    staff,
    setEnabled,
    advance,
    touch,
    reasonText: help?.reason ? reasonLabels[help.reason] : "",
  };
}
