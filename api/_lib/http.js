const { getConfig } = require("./env");

function setCors(req, res, methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]) {
  const { allowedOrigins } = getConfig();
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function handleOptions(req, res, methods) {
  if (req.method === "OPTIONS") {
    setCors(req, res, methods);
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function badRequest(res, message) {
  return json(res, 400, { error: message });
}

function unauthorized(res, message = "Unauthorized") {
  return json(res, 401, { error: message });
}

function notFound(res, message = "Not found") {
  return json(res, 404, { error: message });
}

function serverError(res, error) {
  console.error(error);
  return json(res, 500, { error: "Internal server error" });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", reject);
  });
}

module.exports = {
  setCors,
  handleOptions,
  json,
  badRequest,
  unauthorized,
  notFound,
  serverError,
  readJsonBody
};
