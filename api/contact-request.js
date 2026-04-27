const {
  setCors,
  handleOptions,
  json,
  badRequest,
  serverError,
  readJsonBody
} = require("./_lib/http");
const { client, ensureSchema } = require("./_lib/turso");

function sanitize(value, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;
  setCors(req, res, ["POST", "OPTIONS"]);

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    await ensureSchema();

    await client.execute(`
      CREATE TABLE IF NOT EXISTS contact_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT NOT NULL DEFAULT 'submitted',
        source TEXT NOT NULL DEFAULT 'website',
        full_name TEXT,
        email TEXT,
        phone TEXT,
        subject TEXT,
        message TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const body = await readJsonBody(req);
    const status = sanitize(body.status || "submitted", 40).toLowerCase();
    const source = sanitize(body.source || "website", 80);
    const fullName = sanitize(body.fullName, 160);
    const email = sanitize(body.email, 180);
    const phone = sanitize(body.phone, 80);
    const subject = sanitize(body.subject, 200);
    const message = sanitize(body.message, 5000);

    if (!status) {
      return badRequest(res, "status is required");
    }

    await client.execute({
      sql: `
        INSERT INTO contact_requests (status, source, full_name, email, phone, subject, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [status, source, fullName, email, phone, subject, message]
    });

    return json(res, 201, { ok: true });
  } catch (error) {
    return serverError(res, error);
  }
};
