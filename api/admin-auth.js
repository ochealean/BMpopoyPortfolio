const {
  setCors,
  handleOptions,
  json,
  badRequest,
  serverError,
  readJsonBody
} = require("./_lib/http");
const {
  validateSupervisorCredentials,
  signAdminToken,
  setAuthCookie,
  clearAuthCookie,
  requireAdmin
} = require("./_lib/auth");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "POST", "DELETE", "OPTIONS"])) return;
  setCors(req, res, ["GET", "POST", "DELETE", "OPTIONS"]);

  try {
    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const email = String(body.email || "").trim();
      const password = String(body.password || "");

      if (!email || !password) {
        return badRequest(res, "Email and password are required");
      }

      const valid = validateSupervisorCredentials(email, password);
      if (!valid) {
        return json(res, 401, { error: "Invalid credentials" });
      }

      const token = signAdminToken(email);
      setAuthCookie(req, res, token);
      return json(res, 200, { ok: true, email });
    }

    if (req.method === "GET") {
      const admin = requireAdmin(req, res);
      if (!admin) return;
      return json(res, 200, { authenticated: true, email: admin.email });
    }

    if (req.method === "DELETE") {
      clearAuthCookie(req, res);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return serverError(res, error);
  }
};
