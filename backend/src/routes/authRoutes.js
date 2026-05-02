const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, type: user.type },
    process.env.JWT_SECRET || "dev_secret_change_me",
    { expiresIn: "7d" }
  );
};

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, type, fullName, address, mobileNumber } = req.body;

    if (!email || !password || !type) {
      return res
        .status(400)
        .json({ message: "Email, password and type are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      type,
    });

    if (fullName && address && mobileNumber) {
      await Profile.create({
        user: user._id,
        fullName,
        address,
        mobileNumber,
      });
    }

    const token = signToken(user);
    res
      .cookie("token", token, authCookieOptions)
      .status(201)
      .json({
        user: {
          id: user._id,
          email: user.email,
          type: user.type,
        },
      });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.provider === "google" && !user.passwordHash) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res
      .cookie("token", token, authCookieOptions)
      .json({
        user: {
          id: user._id,
          email: user.email,
          type: user.type,
        },
      });
  } catch (err) {
    next(err);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { token, type } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
      // Important: Use your actual client ID here, or pass it from env.
      // If we don't pass an audience, it still verifies the signature, but audience verification is safer.
    });
    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ message: "No email returned from Google" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists, log them in
      const jwtToken = signToken(user);
      return res
        .cookie("token", jwtToken, authCookieOptions)
        .json({
          user: {
            id: user._id,
            email: user.email,
            type: user.type,
          },
        });
    } else {
      // User doesn't exist
      if (!type) {
        // Came from Login page, where they just clicked "Sign in with Google" but have no account
        return res.status(404).json({ message: "Account not found. Please create one by selecting a role on the register page." });
      }

      // Came from Register page, create the account
      user = await User.create({
        email: email.toLowerCase(),
        provider: 'google',
        googleId,
        type,
      });

      const jwtToken = signToken(user);
      return res
        .cookie("token", jwtToken, authCookieOptions)
        .status(201)
        .json({
          user: {
            id: user._id,
            email: user.email,
            type: user.type,
          },
        });
    }
  } catch (err) {
    console.error("[authRoutes] Google Auth Error:", err);
    res.status(401).json({ message: "Invalid Google token" });
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      (req.headers.authorization || "").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const jwt = require("jsonwebtoken");
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        type: user.type,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/profile", async (req, res, next) => {
  try {
    console.log("[authRoutes] GET /profile - incoming", { method: req.method, path: req.path, origin: req.headers.origin });
    const token =
      req.cookies.token ||
      (req.headers.authorization || "").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const jwt = require("jsonwebtoken");
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );

    const profile = await Profile.findOne({ user: payload.id });
    if (!profile) {
      console.log(`[authRoutes] GET /profile - profile not found for user ${payload.id}`);
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log(`[authRoutes] GET /profile - found profile for user ${payload.id}`);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

router.put("/profile", async (req, res, next) => {
  try {
    console.log("[authRoutes] PUT /profile - incoming", { method: req.method, path: req.path, origin: req.headers.origin });
    const token =
      req.cookies.token ||
      (req.headers.authorization || "").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const jwt = require("jsonwebtoken");
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );

    console.log(`[authRoutes] PUT /profile - token payload: ${JSON.stringify(payload)}`);

    const { fullName, address, mobileNumber } = req.body;

    if (!fullName || !address || !mobileNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let profile = await Profile.findOne({ user: payload.id });
    if (!profile) {
      console.log(`[authRoutes] PUT /profile - creating profile for user ${payload.id}`);
      profile = await Profile.create({
        user: payload.id,
        fullName,
        address,
        mobileNumber,
      });
    } else {
      console.log(`[authRoutes] PUT /profile - updating profile ${profile._id} for user ${payload.id}`);
      profile.fullName = fullName;
      profile.address = address;
      profile.mobileNumber = mobileNumber;
      await profile.save();
    }

    res.json({ profile });
  } catch (err) {
    console.error("[authRoutes] PUT /profile - error", err && err.message);
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res
    .clearCookie("token", authCookieOptions)
    .json({ message: "Logged out" });
});

module.exports = router;

