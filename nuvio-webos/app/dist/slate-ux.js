var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// ../pens/ranch/products/lg-fleet/src/ux/monad.ts
var exports_monad = {};
__export(exports_monad, {
  Err: () => Err,
  Ok: () => Ok,
  askRTE: () => askRTE,
  chainRTE: () => chainRTE,
  chainTE: () => chainTE,
  composeK: () => composeK,
  duplicate2D: () => duplicate2D,
  extend2D: () => extend2D,
  extract2D: () => extract2D,
  flatMapR: () => flatMapR,
  foldR: () => foldR,
  isErr: () => isErr,
  isOk: () => isOk,
  launchHomeOrSlateRTE: () => launchHomeOrSlateRTE,
  makeZipper2D: () => makeZipper2D,
  mapR: () => mapR,
  mapTE: () => mapTE,
  move2D: () => move2D,
  orElseR: () => orElseR,
  orElseTE: () => orElseTE,
  sendTvToastRTE: () => sendTvToastRTE,
  switchHdmiRTE: () => switchHdmiRTE,
  tryCatchTE: () => tryCatchTE
});

// ../pens/ranch/products/lg-fleet/src/ux/focus.ts
var exports_focus = {};
__export(exports_focus, {
  createFocusEngine: () => createFocusEngine
});

// ../pens/ranch/products/lg-fleet/src/ux/rail.ts
var exports_rail = {};
__export(exports_rail, {
  railVisible: () => railVisible,
  railWindow: () => railWindow
});

// ../pens/ranch/products/lg-fleet/src/ux/epg.ts
var exports_epg = {};
__export(exports_epg, {
  epgRailItems: () => epgRailItems
});

// ../pens/ranch/products/lg-fleet/src/ux/osd.ts
var exports_osd = {};
__export(exports_osd, {
  createOsd: () => createOsd
});

// ../pens/ranch/products/lg-fleet/src/ux/hero.ts
var exports_hero = {};
__export(exports_hero, {
  createHero: () => createHero
});

// ../pens/ranch/products/lg-fleet/src/ux/tokens.ts
var exports_tokens = {};
__export(exports_tokens, {
  SLATE_TOKENS: () => SLATE_TOKENS,
  tokenCss: () => tokenCss
});

// ../pens/ranch/products/lg-fleet/src/ux/wire.ts
var exports_wire = {};
__export(exports_wire, {
  fetchLiveChannels: () => fetchLiveChannels,
  fetchLiveChannelsFromCatalog: () => fetchLiveChannelsFromCatalog,
  pickHero: () => pickHero,
  resolveStream: () => resolveStream,
  toEpgItems: () => toEpgItems
});

// ../pens/ranch/products/lg-fleet/src/ux/loom.ts
var exports_loom = {};
__export(exports_loom, {
  pageWindow: () => pageWindow,
  visibleIndexes: () => visibleIndexes
});

// ../pens/ranch/products/lg-fleet/packages/netflix-ux/src/index.ts
var exports_src = {};
__export(exports_src, {
  createBillboard: () => createBillboard,
  createEPG: () => createEPG,
  createFocus: () => createFocus,
  createOSD: () => createOSD,
  createSwitcher: () => createSwitcher,
  currentBillboardItem: () => currentBillboardItem,
  getRail: () => getRail,
  hideOSD: () => hideOSD,
  jumpFocus: () => jumpFocus,
  moveFocus: () => moveFocus,
  nowNextFor: () => nowNextFor,
  selectBillboardItem: () => selectBillboardItem,
  setFocusedId: () => setFocusedId,
  showOSD: () => showOSD,
  switchChannel: () => switchChannel,
  switchResultOk: () => switchResultOk,
  tickBillboard: () => tickBillboard,
  tickOSD: () => tickOSD
});

// ../pens/ranch/products/lg-fleet/src/ux/monad.ts
var Ok = (value) => ({ _tag: "Ok", value });
var Err = (error) => ({ _tag: "Err", error });
var isOk = (r) => r._tag === "Ok";
var isErr = (r) => r._tag === "Err";
var mapR = (r, f) => isOk(r) ? Ok(f(r.value)) : r;
var flatMapR = (r, f) => isOk(r) ? f(r.value) : r;
var orElseR = (r, f) => isOk(r) ? r : f(r.error);
var foldR = (r, onErr, onOk) => isOk(r) ? onOk(r.value) : onErr(r.error);
var tryCatchTE = (thunk, onErr = (u) => String(u)) => async () => {
  try {
    return Ok(await thunk());
  } catch (e) {
    return Err(onErr(e));
  }
};
var mapTE = (te, f) => async () => mapR(await te(), f);
var chainTE = (te, f) => async () => {
  const r = await te();
  return isOk(r) ? f(r.value)() : r;
};
var orElseTE = (te, f) => async () => {
  const r = await te();
  return isOk(r) ? r : f(r.error)();
};
var composeK = (f, g) => async (a) => {
  const rb = await f(a);
  return isOk(rb) ? g(rb.value) : rb;
};
var askRTE = () => (env) => async () => Ok(env);
var chainRTE = (rte, f) => (env) => chainTE(rte(env), (a) => f(a)(env));
function makeZipper2D(rows, r = 0, c = 0) {
  const nonEmpty = rows.filter((row) => row.length > 0);
  if (nonEmpty.length === 0)
    return Err("Zipper2D requires at least one non-empty row");
  const safeR = Math.max(0, Math.min(r, nonEmpty.length - 1));
  const safeC = Math.max(0, Math.min(c, nonEmpty[safeR].length - 1));
  return Ok({ rows: nonEmpty, r: safeR, c: safeC });
}
function extract2D(z) {
  return z.rows[z.r][z.c];
}
function move2D(z, dir) {
  if (dir === "left") {
    return { ...z, c: Math.max(0, z.c - 1) };
  }
  if (dir === "right") {
    const rowLen = z.rows[z.r].length;
    return { ...z, c: Math.min(rowLen - 1, z.c + 1) };
  }
  const nextR = dir === "up" ? Math.max(0, z.r - 1) : Math.min(z.rows.length - 1, z.r + 1);
  const nextRowLen = z.rows[nextR].length;
  return { ...z, r: nextR, c: Math.min(z.c, nextRowLen - 1) };
}
function duplicate2D(z) {
  const dupRows = z.rows.map((row, ri) => row.map((_, ci) => ({ rows: z.rows, r: ri, c: ci })));
  return { rows: dupRows, r: z.r, c: z.c };
}
function extend2D(z, f) {
  const dup = duplicate2D(z);
  return {
    rows: dup.rows.map((row) => row.map((cellZipper) => f(cellZipper))),
    r: z.r,
    c: z.c
  };
}
var switchHdmiRTE = (port) => (env) => tryCatchTE(async () => {
  const f = env.fetchFn ?? fetch;
  const appId = `com.webos.app.hdmi${port}`;
  const res = await f(`${env.baseUrl}/__tv/launch`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: appId })
  });
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`);
  return { launched: appId };
});
var launchHomeOrSlateRTE = (target) => (env) => tryCatchTE(async () => {
  const f = env.fetchFn ?? fetch;
  const id = target === "slate" ? "com.toxicwind.slate" : "com.webos.app.home";
  const res = await f(`${env.baseUrl}/__tv/launch`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id })
  });
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`);
  return { launched: id };
});
var sendTvToastRTE = (message) => (env) => tryCatchTE(async () => {
  const f = env.fetchFn ?? fetch;
  const res = await f(`${env.baseUrl}/__tv/toast`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message })
  });
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`);
  return { toast: true };
});

// ../pens/ranch/products/lg-fleet/src/ux/focus.ts
function createFocusEngine(rects, initial, options = {}) {
  let current = initial;
  function center(r) {
    return { cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
  }
  function move(dir) {
    const from = rects.get(current);
    if (!from)
      return current;
    const fc = center(from);
    let best;
    for (const [id, r] of rects) {
      if (id === current)
        continue;
      const c = center(r);
      const dx = c.cx - fc.cx;
      const dy = c.cy - fc.cy;
      if (dir === "right" && dx <= 0)
        continue;
      if (dir === "left" && dx >= 0)
        continue;
      if (dir === "down" && dy <= 0)
        continue;
      if (dir === "up" && dy >= 0)
        continue;
      const primary = dir === "up" || dir === "down" ? Math.abs(dy) : Math.abs(dx);
      const ortho = dir === "up" || dir === "down" ? Math.abs(dx) : Math.abs(dy);
      const score = primary + ortho * 2;
      if (!best || score < best.score)
        best = { id, score };
    }
    if (!best)
      return current;
    const prev = current;
    current = best.id;
    options.onFocus?.(prev, current);
    return current;
  }
  return {
    move,
    get current() {
      return current;
    },
    set(id) {
      if (rects.has(id)) {
        const prev = current;
        current = id;
        options.onFocus?.(prev, id);
      }
    }
  };
}

// ../pens/ranch/products/lg-fleet/src/ux/rail.ts
function railVisible(items, isLoading) {
  return isLoading || items.length > 0;
}
function railWindow(items, page, perPage) {
  return items.slice(page * perPage, (page + 1) * perPage);
}

// ../pens/ranch/products/lg-fleet/src/ux/epg.ts
function epgRailItems(channels, atMs) {
  return channels.map((channel) => {
    const sorted = [...channel.programs].sort((a, b) => a.start - b.start);
    const now = sorted.find((p) => p.start <= atMs && atMs < p.end);
    const next = now ? sorted.find((p) => p.start >= now.end) : sorted.find((p) => p.start > atMs);
    const progressFraction = now ? Math.min(1, Math.max(0, (atMs - now.start) / (now.end - now.start))) : undefined;
    return { id: channel.id, name: channel.name, now, next, progressFraction };
  });
}

// ../pens/ranch/products/lg-fleet/src/ux/osd.ts
function createOsd(timeoutMs = 3000, options = {}) {
  let buf = "";
  let timer = null;
  const { channels = [], onCommit } = options;
  const resetTimer = () => {
    if (timer)
      clearTimeout(timer);
    timer = setTimeout(() => {
      buf = "";
    }, timeoutMs);
  };
  const numeric = (c) => c.replace(/[^0-9]/g, "");
  const tryCommit = () => {
    if (!channels.length || !onCommit)
      return false;
    const exact = channels.find((c) => numeric(c) === buf);
    if (exact) {
      buf = "";
      onCommit(exact);
      return true;
    }
    const matches = channels.filter((c) => numeric(c).startsWith(buf));
    if (buf.length >= 2 && matches.length === 1) {
      buf = "";
      onCommit(matches[0]);
      return true;
    }
    return false;
  };
  return {
    digit(d) {
      if (!/^[0-9]$/.test(d))
        return;
      buf += d;
      resetTimer();
      tryCommit();
    },
    buffer() {
      return buf;
    },
    commit() {
      const exact = channels.find((c) => c === buf);
      if (exact && onCommit) {
        buf = "";
        onCommit(exact);
        return exact;
      }
      return;
    }
  };
}

// ../pens/ranch/products/lg-fleet/src/ux/hero.ts
function createHero(items, initialIndex = 0, onRotate) {
  let idx = items.length ? Math.min(Math.max(0, initialIndex), items.length - 1) : 0;
  return {
    current() {
      return items[idx];
    },
    rotate() {
      if (!items.length)
        return;
      idx = (idx + 1) % items.length;
      onRotate?.(items[idx]);
    },
    get index() {
      return idx;
    }
  };
}

// ../pens/ranch/products/lg-fleet/src/ux/tokens.ts
var SLATE_TOKENS = {
  overscanPx: 32,
  colors: {
    background: "#000000",
    panel: "#0a0a0c",
    raised: "#141418",
    text: "#f5f5f7",
    muted: "#8e8e96",
    accent: "#4f7cff",
    accentHot: "#7aa2ff",
    focus: "#ffffff",
    danger: "#ff3366"
  },
  motion: {
    focusMs: 140,
    heroRotateMs: 8000,
    osdFadeMs: 3200
  },
  typography: {
    base: "20px",
    hero: "56px"
  }
};
function tokenCss() {
  const c = SLATE_TOKENS;
  return `:root {
--slate-overscan: ${c.overscanPx}px;
--slate-bg: ${c.colors.background};
--slate-panel: ${c.colors.panel};
--slate-raised: ${c.colors.raised};
--slate-text: ${c.colors.text};
--slate-muted: ${c.colors.muted};
--slate-accent: ${c.colors.accent};
--slate-accent-hot: ${c.colors.accentHot};
--slate-focus: ${c.colors.focus};
--slate-danger: ${c.colors.danger};
--slate-focus-ms: ${c.motion.focusMs}ms;
--slate-hero-ms: ${c.motion.heroRotateMs}ms;
--slate-osd-fade-ms: ${c.motion.osdFadeMs}ms;
}`;
}

// ../pens/ranch/products/lg-fleet/src/ux/wire.ts
async function fetchLiveChannels(fetchJson, manifestUrl) {
  const raw = await fetchJson(manifestUrl);
  const isObj = raw !== null && typeof raw === "object";
  const channels = isObj ? raw.channels : undefined;
  if (!Array.isArray(channels))
    throw new Error(`bridge manifest malformed: ${manifestUrl}`);
  return channels.map((c) => {
    const o = c;
    return {
      id: String(o.id ?? ""),
      name: String(o.name ?? ""),
      streamUrl: String(o.streamUrl ?? ""),
      logo: o.logo === undefined ? undefined : String(o.logo)
    };
  });
}
async function fetchLiveChannelsFromCatalog(fetchJson, catalogUrl) {
  const raw = await fetchJson(catalogUrl);
  const isObj = raw !== null && typeof raw === "object";
  const metas = isObj ? raw.metas : undefined;
  if (!Array.isArray(metas))
    throw new Error(`bridge catalog malformed: ${catalogUrl}`);
  return metas.map((m) => {
    const o = m;
    return {
      id: String(o.id ?? ""),
      name: String(o.name ?? ""),
      streamUrl: String(o.stream ?? o.url ?? ""),
      logo: o.poster === undefined ? undefined : String(o.poster)
    };
  });
}
function resolveStream(channels, digits) {
  const num = (c) => c.replace(/[^0-9]/g, "");
  return channels.find((c) => num(c.id) === digits)?.streamUrl;
}
function pickHero(metas, index) {
  const eligible = metas.map((m) => ({ id: String(m.id ?? ""), name: String(m.name ?? ""), backdrop: m.background === undefined ? "" : String(m.background) })).filter((m) => m.backdrop.length > 0);
  if (eligible.length === 0)
    return;
  return eligible[index % eligible.length];
}
function toEpgItems(channels, epg, atMs) {
  return channels.map((c) => {
    const list = (epg.get(c.id) ?? []).sort((a, b) => a.start - b.start);
    const now = list.find((p) => p.start <= atMs && atMs < p.end);
    const progress = now ? (atMs - now.start) / (now.end - now.start) : 0;
    return {
      id: c.id,
      title: c.name,
      logo: c.logo,
      channelId: c.id,
      now: now?.title,
      progress: Math.max(0, Math.min(1, progress))
    };
  });
}

// ../pens/ranch/products/lg-fleet/src/ux/loom.ts
function pageWindow(win, focus) {
  const page = Math.max(1, win.page);
  const total = Math.max(0, win.total);
  const clamped = Math.max(0, Math.min(focus, total - 1));
  let start = win.start;
  if (clamped < start)
    start = Math.max(0, clamped - page + 1);
  else if (clamped >= start + page)
    start = clamped;
  return { start, page, total };
}
function visibleIndexes(win) {
  const out = [];
  for (let i = win.start;i < Math.min(win.start + win.page, win.total); i++)
    out.push(i);
  return out;
}

// ../pens/ranch/products/lg-fleet/packages/netflix-ux/src/focus.ts
function createFocus(gridW, gridH, startX = 0, startY = 0, wrap = false) {
  const x = clamp(startX, 0, gridW - 1);
  const y = clamp(startY, 0, gridH - 1);
  return {
    focusedId: null,
    x,
    y,
    gridW,
    gridH,
    wrap,
    colLastRow: new Map,
    rowLastCol: new Map
  };
}
function moveFocus(state, direction) {
  const { x, y, gridW, gridH, wrap } = state;
  let nx = x;
  let ny = y;
  let moved = false;
  if (direction === "left") {
    if (x > 0) {
      nx = x - 1;
      moved = true;
    } else if (wrap) {
      nx = gridW - 1;
      moved = true;
    }
  } else if (direction === "right") {
    if (x < gridW - 1) {
      nx = x + 1;
      moved = true;
    } else if (wrap) {
      nx = 0;
      moved = true;
    }
  } else if (direction === "up") {
    if (y > 0) {
      ny = y - 1;
      moved = true;
    } else if (wrap) {
      ny = gridH - 1;
      moved = true;
    }
  } else if (direction === "down") {
    if (y < gridH - 1) {
      ny = y + 1;
      moved = true;
    } else if (wrap) {
      ny = 0;
      moved = true;
    }
  }
  if (!moved) {
    return { focusedId: state.focusedId, x, y, moved: false };
  }
  let restoreX = nx;
  let restoreY = ny;
  if (direction === "up" || direction === "down") {
    const known = state.colLastRow.get(nx);
    if (known !== undefined)
      restoreY = known;
  }
  if (direction === "left" || direction === "right") {
    const known = state.rowLastCol.get(ny);
    if (known !== undefined)
      restoreX = known;
  }
  const colLastRow = new Map(state.colLastRow);
  const rowLastCol = new Map(state.rowLastCol);
  colLastRow.set(x, y);
  rowLastCol.set(y, x);
  restoreX = clamp(restoreX, 0, gridW - 1);
  restoreY = clamp(restoreY, 0, gridH - 1);
  return {
    focusedId: state.focusedId,
    x: restoreX,
    y: restoreY,
    moved: true,
    gridW,
    gridH,
    wrap,
    colLastRow,
    rowLastCol
  };
}
function jumpFocus(state, x, y) {
  const nx = clamp(x, 0, state.gridW - 1);
  const ny = clamp(y, 0, state.gridH - 1);
  if (nx === state.x && ny === state.y) {
    return { focusedId: state.focusedId, x: state.x, y: state.y, moved: false };
  }
  return {
    focusedId: state.focusedId,
    x: nx,
    y: ny,
    moved: true,
    gridW: state.gridW,
    gridH: state.gridH,
    wrap: state.wrap,
    colLastRow: state.colLastRow,
    rowLastCol: state.rowLastCol
  };
}
function setFocusedId(state, id) {
  return { ...state, focusedId: id };
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
// ../pens/ranch/products/lg-fleet/packages/netflix-ux/src/billboard.ts
function createBillboard(items, opts = {}) {
  const index = clamp2(opts.startIndex ?? 0, 0, Math.max(0, items.length - 1));
  return {
    items,
    index,
    autoplay: opts.autoplay ?? true,
    intervalMs: opts.intervalMs ?? 6000,
    elapsedMs: 0
  };
}
function tickBillboard(state, dtMs) {
  if (state.items.length === 0)
    return state;
  const next = { ...state, elapsedMs: state.elapsedMs + dtMs };
  if (!state.autoplay)
    return next;
  if (next.elapsedMs >= next.intervalMs) {
    next.elapsedMs = 0;
    next.index = (next.index + 1) % next.items.length;
  }
  return next;
}
function selectBillboardItem(state, index) {
  if (index < 0 || index >= state.items.length)
    return state;
  return { ...state, index, autoplay: false };
}
function currentBillboardItem(state) {
  return state.items[state.index];
}
function clamp2(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
// ../pens/ranch/products/lg-fleet/packages/netflix-ux/src/epg.ts
function createEPG(programs) {
  const byCh = new Map;
  for (const p of programs) {
    if (!p.channelId)
      continue;
    const arr = byCh.get(p.channelId) ?? [];
    arr.push(p);
    byCh.set(p.channelId, arr);
  }
  const channelIds = Array.from(byCh.keys()).sort();
  const rails = [];
  let channelNumber = 1;
  for (const channelId of channelIds) {
    const progs = byCh.get(channelId);
    progs.sort((a, b) => a.startMs - b.startMs);
    const now = progs.find((p) => p.startMs <= Date.now() && Date.now() < p.endMs);
    const nextIdx = progs.findIndex((p) => p.startMs > Date.now());
    const next = nextIdx >= 0 ? progs[nextIdx] : undefined;
    rails.push({
      channelId,
      channelNumber: channelNumber++,
      channelName: progs[0]?.title ?? channelId,
      now,
      next,
      programs: progs
    });
  }
  const byChannel = new Map(rails.map((r) => [r.channelId, r]));
  return { rails, byChannel };
}
function getRail(state, channelId) {
  return state.byChannel.get(channelId);
}
function nowNextFor(state, channelId) {
  const rail = state.byChannel.get(channelId);
  return rail ? { now: rail.now, next: rail.next } : { now: undefined, next: undefined };
}
// ../pens/ranch/products/lg-fleet/packages/netflix-ux/src/switcher.ts
function createSwitcher(initialChannel = null) {
  return { currentChannel: initialChannel, lastSwitchMs: 0, history: [] };
}
function switchChannel(state, channelId, nowMs) {
  const buffered = state.currentChannel !== null && state.history.length > 0;
  const switchMs = buffered ? 200 : 800;
  const next = {
    currentChannel: channelId,
    lastSwitchMs: nowMs,
    history: [...state.history, channelId]
  };
  const result = {
    ok: true,
    channelId,
    switchMs,
    buffered
  };
  return { state: next, result };
}
function switchResultOk(result) {
  return result.ok && result.switchMs < 1000;
}
// ../pens/ranch/products/lg-fleet/packages/netflix-ux/src/osd.ts
function createOSD() {
  return { visible: false, message: "" };
}
function showOSD(state, message, timeoutMs = 3000) {
  return { visible: true, message, timeoutMs };
}
function hideOSD(state) {
  return { visible: false, message: "", timeoutMs: undefined };
}
function tickOSD(state, dtMs) {
  if (!state.visible || state.timeoutMs === undefined)
    return state;
  const next = { ...state, timeoutMs: state.timeoutMs - dtMs };
  if (next.timeoutMs <= 0)
    return hideOSD(next);
  return next;
}
// ../pens/ranch/products/lg-fleet/src/ux/index.ts
var SlateUX = {
  ...exports_monad,
  ...exports_focus,
  ...exports_rail,
  ...exports_epg,
  ...exports_osd,
  ...exports_hero,
  ...exports_tokens,
  ...exports_wire,
  ...exports_loom,
  ...exports_src
};
if (typeof globalThis !== "undefined") {
  globalThis.SlateUX = SlateUX;
}
export {
  Err,
  Ok,
  SLATE_TOKENS,
  SlateUX,
  askRTE,
  chainRTE,
  chainTE,
  composeK,
  createBillboard,
  createEPG,
  createFocus,
  createFocusEngine,
  createHero,
  createOSD,
  createOsd,
  createSwitcher,
  currentBillboardItem,
  duplicate2D,
  epgRailItems,
  extend2D,
  extract2D,
  fetchLiveChannels,
  fetchLiveChannelsFromCatalog,
  flatMapR,
  foldR,
  getRail,
  hideOSD,
  isErr,
  isOk,
  jumpFocus,
  launchHomeOrSlateRTE,
  makeZipper2D,
  mapR,
  mapTE,
  move2D,
  moveFocus,
  nowNextFor,
  orElseR,
  orElseTE,
  pageWindow,
  pickHero,
  railVisible,
  railWindow,
  resolveStream,
  selectBillboardItem,
  sendTvToastRTE,
  setFocusedId,
  showOSD,
  switchChannel,
  switchHdmiRTE,
  switchResultOk,
  tickBillboard,
  tickOSD,
  toEpgItems,
  tokenCss,
  tryCatchTE,
  visibleIndexes
};
