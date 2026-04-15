const { createClient } = require("@libsql/client");
const { getConfig } = require("./env");
const { defaultSections } = require("./sections-defaults");

const config = getConfig();
const client = createClient({
  url: config.tursoUrl,
  authToken: config.tursoToken
});

let initPromise = null;

async function ensureSchema() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await client.execute("PRAGMA foreign_keys = ON");

    await client.batch(
      [
        `
        CREATE TABLE IF NOT EXISTS sections (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
        `
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          event_date TEXT NOT NULL,
          location TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
        `
        CREATE TABLE IF NOT EXISTS event_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          file_name TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          byte_size INTEGER NOT NULL,
          image_blob BLOB NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        )
      `,
        `
        CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date DESC, id DESC)
      `,
        `
        CREATE INDEX IF NOT EXISTS idx_event_images_event_id ON event_images(event_id, id)
      `
      ],
      "write"
    );

    const seedStatements = Object.entries(defaultSections).map(([key, value]) => ({
      sql: "INSERT OR IGNORE INTO sections (key, value_json) VALUES (?, ?)",
      args: [key, JSON.stringify(value)]
    }));

    if (seedStatements.length > 0) {
      await client.batch(seedStatements, "write");
    }
  })();

  return initPromise;
}

module.exports = {
  client,
  ensureSchema
};
