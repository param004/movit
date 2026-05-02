import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./styles.css";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, isGoogleAuthConfigured } from "./config/googleAuth";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isGoogleAuthConfigured ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </React.StrictMode>
);

