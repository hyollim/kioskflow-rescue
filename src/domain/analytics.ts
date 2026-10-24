import type { KioskEvent } from "./events";
export interface SessionSummary {
  id: string;
  events: KioskEvent[];
  start: KioskEvent;
  end?: KioskEvent;
}
const rate = (n: number, d: number) => (d > 0 ? n / d : null);
export function summarizeSessions(input: KioskEvent[]): SessionSummary[] {
  const unique = [...new Map(input.map((e) => [e.id, e])).values()];
  const grouped = new Map<string, KioskEvent[]>();
  for (const e of unique) {
    const group = grouped.get(e.sessionId) ?? [];
    group.push(e);
    grouped.set(e.sessionId, group);
  }
  return [...grouped.entries()].flatMap(([id, events]) => {
    events.sort((a, b) => a.at - b.at);
    const start = events.find((e) => e.name === "session_started");
    if (!start) return [];
    const scoped = events
      .slice(events.indexOf(start))
      .filter((e) => e.mode === start.mode && e.source === start.source);
    const endIndex = scoped.findIndex(
      (e) => e.name === "order_completed" || e.name === "session_abandoned",
    );
    const end = endIndex >= 0 ? scoped[endIndex] : undefined;
    return [
      {
        id,
        start,
        end,
        events: endIndex >= 0 ? scoped.slice(0, endIndex + 1) : scoped,
      },
    ];
  });
}
export function computeKpis(input: KioskEvent[]) {
  const sessions = summarizeSessions(input);
  const completed = sessions.filter((s) => s.end?.name === "order_completed"),
    abandoned = sessions.filter((s) => s.end?.name === "session_abandoned"),
    ended = completed.length + abandoned.length;
  let offers = 0,
    accepted = 0,
    dismissed = 0,
    proxyEligible = 0,
    proxy = 0;
  for (const s of sessions) {
    const map = new Map<string, KioskEvent>();
    for (const e of s.events)
      if (e.name === "help_offered" && e.offerId && !map.has(e.offerId))
        map.set(e.offerId, e);
    for (const offer of map.values()) {
      offers++;
      const offerIndex = s.events.indexOf(offer);
      const response = s.events
        .slice(offerIndex + 1)
        .find(
          (e) =>
            e.offerId === offer.offerId &&
            (e.name === "help_accepted" || e.name === "help_dismissed"),
        );
      if (response?.name === "help_accepted") accepted++;
      if (response?.name === "help_dismissed") {
        dismissed++;
        if (s.end) {
          proxyEligible++;
          const responseIndex = s.events.indexOf(response);
          const laterHelp = s.events
            .slice(responseIndex + 1)
            .some(
              (e) => e.name === "help_requested" || e.name === "help_accepted",
            );
          if (
            s.end.name === "order_completed" &&
            s.end.at >= response.at &&
            s.end.at - response.at <= 30_000 &&
            !laterHelp
          )
            proxy++;
        }
      }
    }
  }
  const hasHelp = (s: SessionSummary) =>
    s.events.some(
      (e) => e.name === "help_requested" || e.name === "help_accepted",
    );
  const helpEnded = sessions.filter((s) => s.end && hasHelp(s));
  const helpCompleted = helpEnded.filter(
    (s) => s.end?.name === "order_completed",
  ).length;
  return {
    started: sessions.length,
    completed: completed.length,
    abandoned: abandoned.length,
    ended,
    open: sessions.length - ended,
    completionRate: rate(completed.length, ended),
    abandonmentRate: rate(abandoned.length, ended),
    averageCompletionSeconds: completed.length
      ? completed.reduce((n, s) => n + (s.end!.at - s.start.at) / 1000, 0) /
        completed.length
      : null,
    helpRequestRate: rate(
      sessions.filter((s) => s.events.some((e) => e.name === "help_requested"))
        .length,
      sessions.length,
    ),
    autoOfferRate: rate(
      sessions.filter((s) => s.events.some((e) => e.name === "help_offered"))
        .length,
      sessions.length,
    ),
    acceptanceRate: rate(accepted, offers),
    dismissalRate: rate(dismissed, offers),
    afterHelpCompletionRate: rate(helpCompleted, helpEnded.length),
    unnecessaryProxyRate: rate(proxy, proxyEligible),
    staffRequestRate: rate(
      sessions.filter((s) =>
        s.events.some((e) => e.name === "staff_assistance_requested"),
      ).length,
      sessions.length,
    ),
    offers,
    accepted,
    dismissed,
    unanswered: offers - accepted - dismissed,
    helpEnded: helpEnded.length,
    helpCompleted,
    proxyEligible,
    proxy,
  };
}
export function formatRate(n: number | null) {
  return n === null ? "—" : `${(n * 100).toFixed(1)}%`;
}
