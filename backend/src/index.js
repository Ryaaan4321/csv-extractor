import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { UPLOAD_DIR } from "./utils/paths.js";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;


if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});