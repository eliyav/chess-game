import express from "express";
import { fileURLToPath } from "node:url";
import path from "path";

const clientPath = fileURLToPath(new URL("../client", import.meta.url));

const app = express();
app.use(express.static(clientPath));
app.get("*", function (req, res) {
  res.sendFile(path.join(clientPath, "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
