const {
  setCors,
  handleOptions,
  json,
  serverError
} = require("./_lib/http");
const { getAdminFromRequest } = require("./_lib/auth");
const { client, ensureSchema } = require("./_lib/turso");
const { getEnv } = require("./_lib/env");

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "OPTIONS"])) return;
  setCors(req, res, ["GET", "OPTIONS"]);

  if (req.method !== "GET") {
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

    const admin = getAdminFromRequest(req);

    const [requestResult, storageResult, eventResult] = await Promise.all([
      client.execute({
        sql: `
          SELECT
            COUNT(*) AS total_requests,
            SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) AS submitted_requests,
            SUM(CASE WHEN status = 'unavailable' THEN 1 ELSE 0 END) AS unavailable_requests
          FROM contact_requests
        `
      }),
      client.execute({
        sql: "SELECT COALESCE(SUM(byte_size), 0) AS storage_used_bytes, COUNT(*) AS total_images FROM event_images"
      }),
      client.execute({
        sql: "SELECT COUNT(*) AS total_events FROM events"
      })
    ]);

    const requestRow = requestResult.rows[0] || {};
    const storageRow = storageResult.rows[0] || {};
    const eventRow = eventResult.rows[0] || {};

    const storageUsedBytes = toNumber(storageRow.storage_used_bytes);
    const configuredLimit = Number.parseInt(getEnv("TURSO_STORAGE_LIMIT_BYTES", "1073741824"), 10);
    const storageLimitBytes = Number.isFinite(configuredLimit) && configuredLimit > 0
      ? configuredLimit
      : 1073741824;
    const storageFreeBytes = Math.max(0, storageLimitBytes - storageUsedBytes);

    return json(res, 200, {
      authenticated: !!admin,
      requests: {
        total: toNumber(requestRow.total_requests),
        submitted: toNumber(requestRow.submitted_requests),
        unavailable: toNumber(requestRow.unavailable_requests)
      },
      storage: {
        usedBytes: storageUsedBytes,
        limitBytes: storageLimitBytes,
        freeBytes: storageFreeBytes,
        usedPercent: storageLimitBytes > 0 ? Number(((storageUsedBytes / storageLimitBytes) * 100).toFixed(2)) : 0
      },
      media: {
        totalImages: toNumber(storageRow.total_images),
        totalEvents: toNumber(eventRow.total_events)
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return serverError(res, error);
  }
};
