export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const isGoogleAuthConfigured =
  Boolean(GOOGLE_CLIENT_ID) && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID";