const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

export default function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({ status: "ok", message: "API is running" });
    return;
  }

  if (req.method === "POST") {
    // For file processing, we'd need to handle multipart form data
    // This is a simplified version that expects JSON
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: "filePath is required" });
    }

    const mlModelPath = path.join(__dirname, "../ml/model.py");

    exec(`python ${mlModelPath} ${filePath}`, (err, stdout) => {
      if (err) {
        console.error("Error executing ML model:", err);
        return res.status(500).json({ error: err.message });
      }

      try {
        res.status(200).json(JSON.parse(stdout));
      } catch (parseErr) {
        res.status(500).json({ error: "Invalid output from ML model" });
      }
    });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
