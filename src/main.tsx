import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CommandApp } from "@/components/sim/CommandApp";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CommandApp />
  </StrictMode>,
);
