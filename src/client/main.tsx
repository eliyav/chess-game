import { createRoot } from "react-dom/client";
import "./client.css";
import App from "./app";

const root = createRoot(document.getElementById("root")!);

root.render(<App />);
