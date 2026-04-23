const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/process", upload.single("file"), (req, res) => {
  const filePath = req.file.path;

  exec(`python ../ml/model.py ${filePath}`, (err, stdout) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      res.json(JSON.parse(stdout));
    } catch {
      res.status(500).json({ error: "Invalid output" });
    }
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});