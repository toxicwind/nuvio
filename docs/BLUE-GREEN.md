# SLATE Architecture: Blue-Green Deployment & Hot-Reload Contract

## 1. Blue-Green Plane Split

| Plane | Host / Target | Role | Runtime Surface |
|---|---|---|---|
| **BLUE (Canary / Dev Plane)** | `awrawr-pc` (`pens://`) | Hot development, compilation, test rigs, live mock | `lg-hot` (:18080), webOS MockTV (:18080/mock), Funnel (`estate.tailc9ac71.ts.net/slate/`) |
| **GREEN (Production Stable)** | `LG webOS TV` (`10.0.0.176:9922`) / `yote` | Target display hardware | `com.toxicwind.slate` native ipk, Luna Bus, `org.webosbrew.inputhook` |

## 2. Don't Reinvent the Wheel — Vendor & Max-Reveal

1. **Vendored Core**: `@slate/netflix-ux` in `pens/ranch/products/lg-fleet/packages/netflix-ux/`.
2. **Compiled Artifact**: `app/dist/slate-ux.js` (6.36 KB pure ESM browser bundle, 0 external runtime dependencies).
3. **Pure Consumption**: `app/index.html` loads directly from `./dist/slate-ux.js` using ES Modules (`import { createFocus, moveFocus, createEPG, nowNextFor }`). Zero hand-rolled spatial focus logic.
4. **Framed Debug Mock**: `app/mock/index.html` reuses `../index.html` via `<iframe>` + synthetic `KeyboardEvent` injection. No parallel mock UI implementation.

## 3. Real-Time Hot-Reloading Pipeline

- `lg-hot` serves the app directory with an automated Server-Sent Events (SSE) `/reload` stream.
- The webOS MockTV outer frame and inner app both subscribe to `/__reload`.
- When changes are committed or saved in `app/`, `lg-hot` dispatches a reload event, refreshing the live view instantly without requiring a full webOS ipk packaging and `ares-install` cycle.

## 4. Hardware & System Levers Available

- **HDMI Switching**: `luna://com.webos.service.eim/getAllInputStatus` + `luna://com.webos.applicationManager/launch` targeting `com.webos.app.hdmi1` through `hdmi4`.
- **Homepage & Key Hijack**: `org.webosbrew.inputhook` maps remote buttons (Home, Input, Settings) to activate SLATE.
- **Audio Control**: `luna-send-pub luna://com.webos.audio/setVolume` / `getVolume`.
- **System Notification**: `luna-send-pub luna://com.webos.notification/createToast`.
