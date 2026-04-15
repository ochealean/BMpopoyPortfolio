const {
  setCors,
  handleOptions,
  json,
  badRequest,
  serverError
} = require("./_lib/http");
const { requireAdmin } = require("./_lib/auth");
const { client, ensureSchema } = require("./_lib/turso");
const { parseMultipart } = require("./_lib/multipart");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES_PER_EVENT = 10;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function normalizeLimit(input, fallback = 10, max = 30) {
  const parsed = Number.parseInt(String(input || fallback), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function normalizeOffset(input, fallback = 0) {
  const parsed = Number.parseInt(String(input || fallback), 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "POST", "DELETE", "OPTIONS"])) return;
  setCors(req, res, ["GET", "POST", "DELETE", "OPTIONS"]);

  try {
    await ensureSchema();

    if (req.method === "GET") {
      const limit = normalizeLimit(req.query.limit, 8, 24);
      const offset = normalizeOffset(req.query.offset, 0);

      const result = await client.execute({
        sql: `
          SELECT
            e.id,
            e.title,
            e.event_date,
            e.location,
            e.created_at,
            (SELECT id FROM event_images i WHERE i.event_id = e.id ORDER BY i.id ASC LIMIT 1) AS cover_image_id,
            (SELECT GROUP_CONCAT(id, ',') FROM (SELECT id FROM event_images i WHERE i.event_id = e.id ORDER BY i.id ASC)) AS image_ids,
            (SELECT COUNT(*) FROM event_images i WHERE i.event_id = e.id) AS image_count
          FROM events e
          ORDER BY e.event_date DESC, e.id DESC
          LIMIT ? OFFSET ?
        `,
        args: [limit, offset]
      });

      const events = result.rows.map((row) => {
        const imageIds = String(row.image_ids || "")
          .split(",")
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0);

        const imageUrls = imageIds.map((imageId) => `/api/event-image?imageId=${imageId}`);
        const coverImageUrl = row.cover_image_id
          ? `/api/event-image?imageId=${Number(row.cover_image_id)}`
          : imageUrls[0] || "";

        return {
          id: Number(row.id),
          title: row.title,
          eventDate: row.event_date,
          location: row.location,
          createdAt: row.created_at,
          imageCount: Number(row.image_count || 0),
          coverImageUrl,
          imageUrls
        };
      });

      return json(res, 200, { events, limit, offset });
    }

    const admin = requireAdmin(req, res);
    if (!admin) return;

    if (req.method === "POST") {
      if (!String(req.headers["content-type"] || "").includes("multipart/form-data")) {
        return badRequest(res, "Expected multipart/form-data");
      }

      const { fields, files } = await parseMultipart(req, {
        maxFileSize: MAX_FILE_SIZE,
        maxFiles: MAX_FILES_PER_EVENT
      });

      const title = String(fields.title || "").trim();
      const eventDate = String(fields.eventDate || "").trim();
      const location = String(fields.location || "").trim();

      if (!title || !eventDate || !location) {
        return badRequest(res, "title, eventDate, and location are required");
      }

      if (!files.length) {
        return badRequest(res, "At least one image is required");
      }

      for (const file of files) {
        if (!ALLOWED_MIME.has(file.mimeType)) {
          return badRequest(res, `Unsupported image type: ${file.mimeType}`);
        }
      }

      let eventId = null;

      try {
        const insertEvent = await client.execute({
          sql: "INSERT INTO events (title, event_date, location) VALUES (?, ?, ?) RETURNING id",
          args: [title, eventDate, location]
        });

        const insertedRow = insertEvent.rows && insertEvent.rows[0] ? insertEvent.rows[0] : null;
        eventId = Number(insertedRow && insertedRow.id);

        if (!Number.isInteger(eventId) || eventId <= 0) {
          throw new Error("Failed to create event record");
        }

        const imageStatements = files.map((file) => ({
          sql: `
            INSERT INTO event_images (event_id, file_name, mime_type, byte_size, image_blob)
            VALUES (?, ?, ?, ?, ?)
          `,
          args: [eventId, file.fileName, file.mimeType, file.size, file.buffer]
        }));

        if (imageStatements.length > 0) {
          await client.batch(imageStatements, "write");
        }

        return json(res, 201, {
          ok: true,
          event: {
            id: eventId,
            title,
            eventDate,
            location,
            imageCount: files.length
          }
        });
      } catch (uploadError) {
        if (eventId && Number.isInteger(eventId)) {
          await client.execute({
            sql: "DELETE FROM events WHERE id = ?",
            args: [eventId]
          });
        }
        throw uploadError;
      }
    }

    if (req.method === "DELETE") {
      const eventId = Number.parseInt(String(req.query.eventId || ""), 10);
      if (Number.isNaN(eventId) || eventId <= 0) {
        return badRequest(res, "Valid eventId is required");
      }

      await client.execute({
        sql: "DELETE FROM events WHERE id = ?",
        args: [eventId]
      });

      return json(res, 200, { ok: true, eventId });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return serverError(res, error);
  }
};
