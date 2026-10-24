/* Read-only QA instrumentation. Loaded only by qa-responsive.html, never by the app. */
window.runKioskFlowDesignAudit = function (name = "current") {
  const frame = document.querySelector("#device"),
    doc = frame.contentDocument,
    win = frame.contentWindow;
  const activeDialog = doc.querySelector('[aria-modal="true"]');
  const visible = (e) => {
    if (activeDialog && !activeDialog.contains(e)) return false;
    if (
      !e.getClientRects().length ||
      win.getComputedStyle(e).visibility === "hidden" ||
      e.closest(".sr-only,.skip-link")
    )
      return false;
    const closed = e.closest("details:not([open])");
    if (closed && !closed.querySelector(":scope > summary")?.contains(e))
      return false;
    return (
      !e.checkVisibility ||
      e.checkVisibility({
        contentVisibilityAuto: true,
        visibilityProperty: true,
      })
    );
  };
  const label = (e) =>
    (e.getAttribute("aria-label") || e.textContent || e.value || e.tagName)
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 140);
  const rgb = (s) => {
    const x = s.match(/[\d.]+/g)?.map(Number);
    return x?.length >= 3 ? [x[0], x[1], x[2], x[3] ?? 1] : [255, 255, 255, 1];
  };
  const bg = (e) => {
    let x = e;
    while (x) {
      const c = rgb(win.getComputedStyle(x).backgroundColor);
      if (c[3] > 0.99) return c;
      x = x.parentElement;
    }
    return [255, 255, 255, 1];
  };
  const lum = (c) =>
    c
      .slice(0, 3)
      .map((x) => x / 255)
      .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
      .reduce((n, x, i) => n + x * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => {
    const x = lum(a),
      y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const texts = [
    ...doc.querySelectorAll(
      "h1,h2,h3,p,span,small,strong,label,legend,button,a,td,th,summary,dt,dd",
    ),
  ].filter(
    (e) =>
      visible(e) &&
      !e.closest("button:disabled") &&
      [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
  );
  const contrast = texts.map((e) => {
    const s = win.getComputedStyle(e),
      font = parseFloat(s.fontSize),
      weight = parseInt(s.fontWeight) || 400,
      required = font >= 24 || (font >= 18.6667 && weight >= 700) ? 3 : 4.5;
    return {
      label: label(e),
      fontPx: font,
      foreground: s.color,
      background: bg(e).slice(0, 3),
      ratio: Number(ratio(rgb(s.color), bg(e)).toFixed(3)),
      required,
    };
  });
  const controls = [
    ...doc.querySelectorAll("button,a,input,select,summary"),
  ].filter((e) => visible(e) && !e.disabled);
  const kioskButtons = [...doc.querySelectorAll(".kiosk button")]
    .filter(visible)
    .map((e) => {
      const r = e.getBoundingClientRect();
      return {
        label: label(e),
        width: Number(r.width.toFixed(2)),
        height: Number(r.height.toFixed(2)),
      };
    });
  const inputClipping = [...doc.querySelectorAll(".number-field input")]
    .filter(visible)
    .map((e) => {
      const s = win.getComputedStyle(e),
        c = doc.createElement("canvas").getContext("2d");
      c.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
      return {
        label: e.labels?.[0]?.textContent,
        value: e.value,
        textWidth: Number(c.measureText(e.value).width.toFixed(2)),
        availableWidth: Number(
          (
            e.clientWidth -
            parseFloat(s.paddingLeft) -
            parseFloat(s.paddingRight)
          ).toFixed(2),
        ),
      };
    })
    .filter((x) => x.textWidth > x.availableWidth + 0.5);
  const tables = [...doc.querySelectorAll(".table-scroll")]
    .filter(visible)
    .map((e) => ({
      label: e.getAttribute("aria-label"),
      clientWidth: e.clientWidth,
      scrollWidth: e.scrollWidth,
      clientHeight: e.clientHeight,
      scrollHeight: e.scrollHeight,
      keyboardFocusable: e.tabIndex === 0,
    }));
  const fullyVisibleControls = controls.filter((e) => {
    const r = e.getBoundingClientRect();
    return (
      r.top >= 0 &&
      r.left >= 0 &&
      r.bottom <= win.innerHeight &&
      r.right <= win.innerWidth
    );
  });
  const hitCoverage = fullyVisibleControls
    .map((e) => {
      const r = e.getBoundingClientRect(),
        hit = doc.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (!hit || e.contains(hit) || hit === e) return null;
      return {
        label: label(e),
        coveredBy: hit.tagName,
        behindStickyNavigation: !!hit.closest(
          ".site-header,.workspace-header,.business-quick-result",
        ),
      };
    })
    .filter(Boolean);
  const covered = hitCoverage.filter((x) => !x.behindStickyNavigation);
  const stickyCoverage = hitCoverage.filter((x) => x.behindStickyNavigation);
  const result = {
    name,
    observedAt: new Date().toISOString(),
    heading: doc.querySelector("main > section:not([hidden]) h1")?.textContent,
    viewport: {
      width: win.innerWidth,
      height: win.innerHeight,
      documentWidth: doc.documentElement.scrollWidth,
      documentHeight: doc.documentElement.scrollHeight,
    },
    fonts: {
      loaded: doc.fonts.check('16px "Pretendard Variable"'),
      family: win.getComputedStyle(doc.body).fontFamily,
    },
    textElementsChecked: texts.length,
    minTextPx: Math.min(...contrast.map((x) => x.fontPx)),
    smallText: contrast.filter((x) => x.fontPx < 14),
    minTextContrast: Math.min(...contrast.map((x) => x.ratio)),
    textContrastFailures: contrast.filter((x) => x.ratio + 0.005 < x.required),
    kioskButtonCount: kioskButtons.length,
    smallKioskButtons: kioskButtons.filter(
      (x) => x.width < 43.99 || x.height < 43.99,
    ),
    numericInputClipping: inputClipping,
    tables,
    fullyInViewportControlsChecked: fullyVisibleControls.length,
    coveredControls: covered,
    behindStickyNavigation: stickyCoverage,
    activeDialogOnly: !!activeDialog,
    scope:
      "Current rendered state in same-origin iframe. Computed solid-color text contrast, fully in-viewport center hit tests, number input text width, kiosk button geometry; excludes disabled controls, closed disclosures and offscreen/screen-reader-only text; content scrolled behind persistent navigation is reported separately, and active modal checks are limited to that dialog. Not an accessibility certification or physical-device test.",
  };
  return result;
};
document.querySelector("#run-design-audit")?.addEventListener("click", () => {
  const out = document.querySelector("#audit-output");
  out.hidden = false;
  out.textContent = JSON.stringify(window.runKioskFlowDesignAudit(), null, 2);
});
