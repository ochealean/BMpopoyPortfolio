function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  return fallback;
}

function requireEnv(name) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getAllowedOrigins() {
  const raw = getEnv("ALLOWED_ORIGINS", "http://localhost:5500,http://127.0.0.1:5500");
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getConfig() {
  return {
    tursoUrl: requireEnv("TURSO_DATABASE_URL"),
    tursoToken: requireEnv("TURSO_AUTH_TOKEN"),
    supervisorEmail: requireEnv("SUPERVISOR_EMAIL"),
    supervisorPassword: getEnv("SUPERVISOR_PASSWORD", ""),
    supervisorPasswordHash: getEnv("SUPERVISOR_PASSWORD_HASH", ""),
    jwtSecret: requireEnv("ADMIN_JWT_SECRET"),
    allowedOrigins: getAllowedOrigins(),
    nodeEnv: getEnv("NODE_ENV", "development")
  };
}

module.exports = {
  getEnv,
  requireEnv,
  getAllowedOrigins,
  getConfig
};
