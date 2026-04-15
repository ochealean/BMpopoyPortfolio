const { setCors, handleOptions, json, serverError } = require("./_lib/http");
const { client, ensureSchema } = require("./_lib/turso");

function parseSectionValue(valueJson) {
  try {
    return JSON.parse(valueJson);
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "OPTIONS"])) return;
  setCors(req, res, ["GET", "OPTIONS"]);

  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    await ensureSchema();

    const [sectionResult, eventResult] = await Promise.all([
      client.execute("SELECT key, value_json, updated_at FROM sections"),
      client.execute({
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
          LIMIT 10
        `
      })
    ]);

    const sections = {};
    for (const row of sectionResult.rows) {
      sections[row.key] = parseSectionValue(row.value_json);
    }

    const events = eventResult.rows.map((row) => {
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

    return json(res, 200, {
      sections,
      events,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return serverError(res, error);
  }
};
