const {
  setCors,
  handleOptions,
  json,
  badRequest,
  serverError,
  readJsonBody,
  notFound
} = require("./_lib/http");
const { requireAdmin } = require("./_lib/auth");
const { client, ensureSchema } = require("./_lib/turso");

function parseSectionValue(valueJson) {
  try {
    return JSON.parse(valueJson);
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "PUT", "DELETE", "OPTIONS"])) return;
  setCors(req, res, ["GET", "PUT", "DELETE", "OPTIONS"]);

  try {
    await ensureSchema();

    if (req.method === "GET") {
      const key = String(req.query.key || "").trim();

      if (key) {
        const rowResult = await client.execute({
          sql: "SELECT key, value_json, updated_at FROM sections WHERE key = ?",
          args: [key]
        });

        if (!rowResult.rows.length) {
          return json(res, 200, { section: null });
        }

        const row = rowResult.rows[0];
        return json(res, 200, {
          section: {
            key: row.key,
            value: parseSectionValue(row.value_json),
            updatedAt: row.updated_at
          }
        });
      }

      const result = await client.execute("SELECT key, value_json, updated_at FROM sections");
      const sections = {};

      for (const row of result.rows) {
        sections[row.key] = {
          value: parseSectionValue(row.value_json),
          updatedAt: row.updated_at
        };
      }

      return json(res, 200, { sections });
    }

    const admin = requireAdmin(req, res);
    if (!admin) return;

    if (req.method === "PUT") {
      const body = await readJsonBody(req);
      const key = String(body.key || "").trim();
      const value = body.value;

      if (!key) {
        return badRequest(res, "Section key is required");
      }

      if (typeof value === "undefined") {
        return badRequest(res, "Section value is required");
      }

      await client.execute({
        sql: `
          INSERT INTO sections (key, value_json, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET
            value_json = excluded.value_json,
            updated_at = CURRENT_TIMESTAMP
        `,
        args: [key, JSON.stringify(value)]
      });

      return json(res, 200, { ok: true, key });
    }

    if (req.method === "DELETE") {
      const key = String(req.query.key || "").trim();
      if (!key) {
        return badRequest(res, "Section key is required");
      }

      await client.execute({
        sql: "DELETE FROM sections WHERE key = ?",
        args: [key]
      });

      return json(res, 200, { ok: true, key });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return serverError(res, error);
  }
};
