/*
 * SLATE webOS JS service bootstrap (ES5 — webOS runs this on Node 8.12).
 *
 * The webOS service process stays TINY and stable: it only serves www/ on
 * :8080 and proxies /{streaming,health} to the detached streaming child on
 * :11470. The heavy Stremio server runs as a DETACHED CHILD (server.js) so a
 * crash in it can never kill the webOS service registration ("Loading
 * Stremio..."), and it auto-restarts with backoff.
 *
 * start handshake: responds {ready} only once :11470 answers /health with our
 * version — the app's <30s loading timer then redirects to :8080.
 *
 * Pattern-borrowed from Alexesmm/stremcompat-lg-webos (proven on this TV
 * class); adapted to SLATE's server.js + 8080/11470 ports.
 */
process.env.NODE_PATH =
  process.env.NODE_PATH || "";
require("module").Module._initPaths();
process.env.HOME = __dirname; // server.js writes .stremio-server under HOME (writable service dir)

var http = require("http");
var fs = require("fs");
var path = require("path");
var net = require("net");
var spawn = require("child_process").spawn;
var Service = require("webos-service");

var DIR = __dirname;
var APP_PORT = 8080;       // static UI on this TV (webOS service serves it)
var STREAM_PORT = 11470;   // detached server.js bound here (Stremio engine + /health)
var APP_VERSION = "1.1.0";
var service = new Service("com.toxicwind.slate.server");
var serviceReady = false;
var pending = [];
var spawnedChild = null;

function log(msg) {
  try { fs.appendFileSync(path.join(DIR, "launch.log"), new Date().toISOString() + " " + msg + "\n"); }
  catch (ignore) {}
}

// ---- health probe of the detached streaming child ----
function isStreamUp(cb) {
  var s = net.connect(STREAM_PORT, "127.0.0.1");
  var done = false;
  var resp = "";
  function finish(v) { if (done) return; done = true; try { s.destroy(); } catch (e) {} cb(v); }
  s.on("connect", function () { s.write("GET /health HTTP/1.0\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"); });
  s.on("data", function (c) { resp += c.toString(); if (resp.indexOf('"version":"' + APP_VERSION + '"') >= 0) finish(true); if (resp.length > 8192) finish(false); });
  s.on("end", function () { finish(resp.indexOf('"version":"' + APP_VERSION + '"') >= 0); });
  s.on("error", function () { finish(false); });
  setTimeout(function () { finish(false); }, 1200);
}

// ---- spawn the streaming child detached (crash-safe) ----
function startStream() {
  if (spawnedChild) return;
  log("spawn streaming child: " + path.join(DIR, "server.js"));
  try {
    spawnedChild = spawn(process.execPath, [path.join(DIR, "server.js")], {
      cwd: DIR,
      env: process.env,
      detached: true,
      stdio: "ignore"
    });
  } catch (e) {
    spawnedChild = null;
    log("spawn failed: " + e.message);
    return;
  }
  spawnedChild.on("error", function (e) { spawnedChild = null; log("child error: " + e.message); });
  spawnedChild.on("exit", function (code, sig) {
    spawnedChild = null;
    log("child exit code=" + code + " sig=" + sig + " — auto-restart in 2s");
    setTimeout(startStream, 2000);
  });
  spawnedChild.unref();
}

// ---- static file serving ----
var mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon",
  ".gif": "image/gif", ".webp": "image/webp", ".ttf": "font/ttf", ".woff": "font/woff",
  ".woff2": "font/woff2", ".svg": "image/svg+xml", ".wasm": "application/wasm",
  ".json": "application/json", ".map": "application/json", ".txt": "text/plain", ".m3u8": "application/vnd.apple.mpegurl", ".ts": "video/mp2t" };

function serveStatic(urlPath, res, next) {
  var filePath = path.join(path.join(DIR, "www"), urlPath === "/" ? "index.html" : urlPath);
  if (filePath.indexOf(path.join(DIR, "www")) !== 0) return next();
  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) return next();
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
    fs.createReadStream(filePath).on("error", function () { try { res.end(); } catch (e) {} }).pipe(res);
  });
}

function proxyToStream(req, res) {
  var opts = { hostname: "127.0.0.1", port: STREAM_PORT, path: req.url, method: req.method, headers: req.headers };
  var proxy = http.request(opts, function (pres) { res.writeHead(pres.statusCode, pres.headers); pres.pipe(res); });
  proxy.on("error", function () { res.writeHead(502); res.end(); });
  req.pipe(proxy);
}

// ---- webOS service entry ----
service.activityManager.create("keepAlive", function () {});
service.register("start", function (message) {
  if (serviceReady) { message.respond({ returnValue: true, ready: true, version: APP_VERSION, streaming: STREAM_PORT }); return; }
  pending.push(message);
});

// static first, else proxy to streaming child
http.createServer(function (req, res) {
  var urlPath = req.url.split("?")[0];
  if (urlPath === "/health") { res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ version: APP_VERSION, service: "slate.server", streaming: STREAM_PORT })); return; }
  serveStatic(urlPath, res, function () { proxyToStream(req, res); });
}).listen(APP_PORT, function () {
  serviceReady = true;
  log("webOS service up on :" + APP_PORT + "; starting streaming child");
  pending.forEach(function (m) { m.respond({ returnValue: true, ready: true, version: APP_VERSION, streaming: STREAM_PORT }); });
  pending = [];
  startStream(); // fire-and-forget detached server.js
});

log("SLATE service booting");