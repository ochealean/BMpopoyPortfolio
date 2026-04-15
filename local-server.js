const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const projectRoot = __dirname;
const port = Number.parseInt(process.env.PORT || "3002", 10) || 3002;

function loadDotEnvFile() {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) continue;

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadDotEnvFile();
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function sendText(res, statusCode, contentType, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", contentType);
  res.end(body);
}

function sendJson(res, statusCode, payload) {
  sendText(res, statusCode, "application/json; charset=utf-8", JSON.stringify(payload));
}

function isWithinProject(filePath) {
  const relative = path.relative(projectRoot, filePath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function resolveStaticFile(urlPath) {
  const cleanPath = decodeURIComponent(urlPath).replace(/\/+$/, "") || "/";

  if (cleanPath === "/") {
    return path.join(projectRoot, "index.html");
  }

  if (cleanPath === "/admin") {
    return path.join(projectRoot, "admin", "index.html");
  }

  const candidate = path.normalize(path.join(projectRoot, cleanPath));
  if (!isWithinProject(candidate)) return null;

  try {
    const stats = fs.statSync(candidate);
    if (stats.isDirectory()) {
      const indexFile = path.join(candidate, "index.html");
      if (fs.existsSync(indexFile)) return indexFile;
    }
    if (stats.isFile()) return candidate;
  } catch {
    // Ignore missing files.
  }

  return null;
}

function serveFile(res, filePath, method) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 500, { error: "Failed to read file" });
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    if (method === "HEAD") {
      res.end();
      return;
    }
    res.end(data);
  });
}

function loadApiHandler(routeName) {
  const handlerPath = path.join(projectRoot, "api", `${routeName}.js`);
  if (!fs.existsSync(handlerPath)) return null;
  return require(handlerPath);
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = requestUrl.pathname;
    req.query = Object.fromEntries(requestUrl.searchParams.entries());
    req.pathname = pathname;

    if (pathname.startsWith("/api/")) {
      const routeName = pathname.slice("/api/".length);

      if (!routeName || routeName.includes("/")) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }

      const handler = loadApiHandler(routeName);
      if (!handler) {
        sendJson(res, 404, { error: "Not found" });
        return;
      }

      await handler(req, res);
      return;
    }

    const staticFile = resolveStaticFile(pathname);
    if (staticFile) {
      serveFile(res, staticFile, req.method || "GET");
      return;
    }

    const fallbackFile = pathname.startsWith("/admin/")
      ? path.join(projectRoot, "admin", "index.html")
      : path.join(projectRoot, "index.html");

    serveFile(res, fallbackFile, req.method || "GET");
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Local server error", details: String(error && error.message ? error.message : error) });
  }
});

server.listen(port, () => {
  console.log(`Local server running at http://localhost:${port}`);
});