import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { LanguageProvider } from "./context/LanguageContext";

import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);