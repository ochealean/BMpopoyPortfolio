const {
  setCors,
  handleOptions,
  json,
  badRequest,
  notFound,
  serverError
} = require("./_lib/http");
const { requireAdmin } = require("./_lib/auth");
const { client, ensureSchema } = require("./_lib/turso");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "DELETE", "OPTIONS"])) return;
  setCors(req, res, ["GET", "DELETE", "OPTIONS"]);

  try {
    await ensureSchema();

    const imageId = Number.parseInt(String(req.query.imageId || ""), 10);
    if (Number.isNaN(imageId) || imageId <= 0) {
      return badRequest(res, "Valid imageId is required");
    }

    if (req.method === "GET") {
      const result = await client.execute({
        sql: "SELECT id, mime_type, image_blob FROM event_images WHERE id = ?",
        args: [imageId]
      });

      if (!result.rows.length) {
        return notFound(res, "Image not found");
      }

      const row = result.rows[0];
      const blob = row.image_blob;
      const buffer = Buffer.isBuffer(blob) ? blob : Buffer.from(blob);

      res.statusCode = 200;
      res.setHeader("Content-Type", row.mime_type || "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.end(buffer);
      return;
    }

    const admin = requireAdmin(req, res);
    if (!admin) return;

    if (req.method === "DELETE") {
      await client.execute({
        sql: "DELETE FROM event_images WHERE id = ?",
        args: [imageId]
      });
      return json(res, 200, { ok: true, imageId });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return serverError(res, error);
  }
};
