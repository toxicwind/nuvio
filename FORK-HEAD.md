# Fork head decision (2026-10-29, architect order)

**nuvio-webos (AETHER) is THE main fork head.**

Origin: Nuvio (cloud media TV app, WhiteGiso lineage) forked into our
self-hosted live-TV shell. The architect picked AETHER as the identity
(2026-10-29 ask; streamers dropped).

- App shell: nuvio-webos `com.toxicwind.aether` (webOS, Stremio-Server service)
- Live-TV engine: IPTV-BRIDGE addon (Xtream/M3U → Live/Movies/Series
  catalogs) deployed at `iptvbridge.joeishere.workers.dev`
- Manifests: `https://aiostreams.torbox.app/manifest.json` (+ local :8080)

Ancestors (kept, not heads): NuvioTVWebOS (strem lineage), NuvioTVSmart
(Nuvio Media Supabase cloud), tapframe/WhiteGiso origins.
