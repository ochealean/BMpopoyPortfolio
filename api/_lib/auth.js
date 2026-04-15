const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { getConfig } = require("./env");
const { unauthorized } = require("./http");

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const pairs = raw.split(";").map((item) => item.trim()).filter(Boolean);
  const cookies = {};

  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx);
    const value = pair.slice(idx + 1);
    cookies[key] = decodeURIComponent(value);
  }

  return cookies;
}

function safeCompare(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function hashSha256(value) {
  return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function validateSupervisorCredentials(email, password) {
  const config = getConfig();
  const emailMatch = safeCompare(String(email).toLowerCase(), String(config.supervisorEmail).toLowerCase());

  if (!emailMatch) return false;

  if (config.supervisorPasswordHash) {
    const incomingHash = hashSha256(password);
    return safeCompare(incomingHash, config.supervisorPasswordHash);
  }

  return safeCompare(password, config.supervisorPassword);
}

function signAdminToken(email) {
  const { jwtSecret } = getConfig();
  return jwt.sign({ role: "admin", email }, jwtSecret, { expiresIn: "12h" });
}

function verifyAdminToken(token) {
  const { jwtSecret } = getConfig();
  return jwt.verify(token, jwtSecret);
}

function setAuthCookie(req, res, token) {
  const { nodeEnv } = getConfig();
  const isSecure = nodeEnv === "production";
  const cookieParts = [
    `bm_admin_session=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=43200"
  ];

  if (isSecure) {
    cookieParts.push("Secure");
  }

  res.setHeader("Set-Cookie", cookieParts.join("; "));
}

function clearAuthCookie(req, res) {
  const { nodeEnv } = getConfig();
  const isSecure = nodeEnv === "production";
  const cookieParts = [
    "bm_admin_session=",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];

  if (isSecure) {
    cookieParts.push("Secure");
  }

  res.setHeader("Set-Cookie", cookieParts.join("; "));
}

function getAuthTokenFromRequest(req) {
  const cookies = parseCookies(req);
  if (cookies.bm_admin_session) return cookies.bm_admin_session;

  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }

  return "";
}

function requireAdmin(req, res) {
  const token = getAuthTokenFromRequest(req);
  if (!token) {
    unauthorized(res, "Login required");
    return null;
  }

  try {
    return verifyAdminToken(token);
  } catch (error) {
    unauthorized(res, "Invalid or expired session");
    return null;
  }
}

function getAdminFromRequest(req) {
  const token = getAuthTokenFromRequest(req);
  if (!token) return null;

  try {
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

module.exports = {
  parseCookies,
  validateSupervisorCredentials,
  signAdminToken,
  verifyAdminToken,
  setAuthCookie,
  clearAuthCookie,
  getAdminFromRequest,
  requireAdmin
};
