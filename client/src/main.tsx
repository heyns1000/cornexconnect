import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupDeepLinks } from "./lib/capacitor-deeplinks";

setupDeepLinks();

createRoot(document.getElementById("root")!).render(<App />);
