import express from "express";
import { fileURLToPath } from "node:url";

const clientPath = fileURLToPath(new URL("../client", import.meta.url));

const app = express();
app.use(express.static(clientPath));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
