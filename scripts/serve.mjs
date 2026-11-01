// A tiny local web server for previewing the site, with no packages to install.
//   node scripts/serve.mjs        (or double-click serve.cmd on Windows)
// Then open http://localhost:4000. Stop it with Ctrl+C.
// It serves the repo root the way GitHub Pages does: /work/ opens work/index.html,
// /work redirects to /work/, and a missing page shows 404.html.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT || 4000);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".mp4": "video/mp4", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
};

async function fileFor(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const full = resolve(ROOT, clean);
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null; // stay inside the site
  if (/(^|[/\\])(\.|_|node_modules)/.test(clean)) return null; // like Pages: no dot or underscore folders
  try {
    const s = await stat(full);
    if (s.isDirectory()) {
      if (!urlPath.endsWith("/")) return { redirect: urlPath + "/" };
      return { path: join(full, "index.html") };
    }
    return { path: full };
  } catch { return null; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const found = await fileFor(url.pathname);
  if (found?.redirect) { res.writeHead(301, { Location: found.redirect + url.search }); return res.end(); }
  try {
    if (!found) throw new Error("missing");
    const body = await readFile(found.path);
    const type = TYPES[extname(found.path).toLowerCase()] || "application/octet-stream";
    const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (range && type === "video/mp4") { // video players ask for pieces of the file
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
      res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${body.length}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
      return res.end(body.subarray(start, end + 1));
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store", "Accept-Ranges": "bytes" });
    res.end(body);
  } catch {
    const notFound = await readFile(join(ROOT, "404.html")).catch(() => Buffer.from("Not found"));
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(notFound);
  }
}).listen(PORT, () => {
  console.log(`Coremosh site: http://localhost:${PORT}  (Ctrl+C to stop)`);
});
