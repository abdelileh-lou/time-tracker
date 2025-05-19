import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Assurez-vous que c'est bien importé
import "./index.css";
import App from "./App.jsx";
import { SnackbarProvider } from "notistack";

window.global = window;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} preventDuplicate>
      <App />
    </SnackbarProvider>
    </BrowserRouter>
  </StrictMode>,
);
