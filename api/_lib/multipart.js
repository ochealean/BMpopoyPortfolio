const Busboy = require("busboy");

function parseMultipart(req, options = {}) {
  const maxFileSize = options.maxFileSize || 5 * 1024 * 1024;
  const maxFiles = options.maxFiles || 10;

  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: maxFileSize,
        files: maxFiles
      }
    });

    busboy.on("field", (fieldName, value) => {
      fields[fieldName] = value;
    });

    busboy.on("file", (fieldName, file, info) => {
      const chunks = [];
      let total = 0;
      let fileTooLarge = false;

      file.on("data", (chunk) => {
        total += chunk.length;
        chunks.push(chunk);
      });

      file.on("limit", () => {
        fileTooLarge = true;
      });

      file.on("end", () => {
        if (fileTooLarge) {
          reject(new Error(`File exceeds limit (${maxFileSize} bytes): ${info.filename}`));
          return;
        }

        files.push({
          fieldName,
          fileName: info.filename || "upload-image",
          mimeType: info.mimeType || "application/octet-stream",
          size: total,
          buffer: Buffer.concat(chunks)
        });
      });
    });

    busboy.on("filesLimit", () => {
      reject(new Error(`Too many files. Maximum allowed is ${maxFiles}`));
    });

    busboy.on("error", (err) => reject(err));
    busboy.on("finish", () => resolve({ fields, files }));

    req.pipe(busboy);
  });
}

module.exports = {
  parseMultipart
};
