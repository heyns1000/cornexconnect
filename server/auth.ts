import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import type { Express, RequestHandler, Request } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { users, userAuditTrail, userRegistrations } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MemoryStoreSession = MemoryStore(session);
  const sessionStore = new MemoryStoreSession({
    checkPeriod: sessionTtl,
    ttl: sessionTtl,
    stale: false,
  });

  return session({
    secret: process.env.SESSION_SECRET || "cornexconnect-secret-key-change-in-production",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

// Helper: log audit event
async function logAudit(userId: string | null, action: string, details: string, req: Request) {
  try {
    await db.insert(userAuditTrail).values({
      userId,
      action,
      details,
      ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      sessionId: req.sessionID || null,
    });
  } catch (e) {
    console.error("Failed to log audit event:", e);
  }
}

// Helper: find or create OAuth user
async function findOrCreateOAuthUser(profile: {
  provider: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}) {
  // Check if user exists by provider + provider ID
  const [existing] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.authProvider, profile.provider),
        eq(users.authProviderId, profile.id)
      )
    )
    .limit(1);

  if (existing) {
    // Update last login
    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, existing.id));
    return existing;
  }

  // Check if email already exists (link accounts)
  if (profile.email) {
    const [byEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);

    if (byEmail) {
      // Link this OAuth provider to existing account
      await db.update(users).set({
        authProvider: profile.provider,
        authProviderId: profile.id,
        profileImageUrl: profile.profileImageUrl || byEmail.profileImageUrl,
        emailVerified: true,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(users.id, byEmail.id));
      return { ...byEmail, authProvider: profile.provider };
    }
  }

  // Create new user
  const [newUser] = await db.insert(users).values({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImageUrl: profile.profileImageUrl,
    authProvider: profile.provider,
    authProviderId: profile.id,
    emailVerified: true, // OAuth emails are verified by provider
    lastLoginAt: new Date(),
    role: "viewer",
  }).returning();

  return newUser;
}

// Get the base URL for OAuth callbacks
function getBaseUrl(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL;
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
  return `${protocol}://${host}`;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize/deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, { id: user.id, email: user.email });
  });

  passport.deserializeUser(async (data: { id: string; email: string }, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, data.id)).limit(1);
      done(null, user || null);
    } catch (err) {
      done(err, null);
    }
  });

  // ============================================
  // GOOGLE OAuth Strategy
  // ============================================
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await findOrCreateOAuthUser({
              provider: "google",
              id: profile.id,
              email: profile.emails?.[0]?.value || "",
              firstName: profile.name?.givenName || profile.displayName || "",
              lastName: profile.name?.familyName || "",
              profileImageUrl: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) {
            done(err as Error, undefined);
          }
        }
      )
    );
    console.log("Google OAuth strategy configured");
  } else {
    console.log("Google OAuth: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set - skipping");
  }

  // ============================================
  // MICROSOFT OAuth Strategy
  // ============================================
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    // Microsoft uses passport-microsoft which follows OAuth2
    const MicrosoftStrategy = (await import("passport-microsoft")).default?.Strategy
      || (await import("passport-microsoft")).Strategy;

    passport.use(
      new MicrosoftStrategy(
        {
          clientID: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          callbackURL: "/api/auth/microsoft/callback",
          scope: ["user.read"],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const user = await findOrCreateOAuthUser({
              provider: "microsoft",
              id: profile.id,
              email: profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName || "",
              firstName: profile.name?.givenName || profile.displayName?.split(" ")[0] || "",
              lastName: profile.name?.familyName || profile.displayName?.split(" ").slice(1).join(" ") || "",
              profileImageUrl: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) {
            done(err, undefined);
          }
        }
      )
    );
    console.log("Microsoft OAuth strategy configured");
  } else {
    console.log("Microsoft OAuth: MICROSOFT_CLIENT_ID / MICROSOFT_CLIENT_SECRET not set - skipping");
  }

  // ============================================
  // GITHUB OAuth Strategy
  // ============================================
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: "/api/auth/github/callback",
          scope: ["user:email"],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const user = await findOrCreateOAuthUser({
              provider: "github",
              id: profile.id,
              email: profile.emails?.[0]?.value || "",
              firstName: profile.displayName?.split(" ")[0] || profile.username || "",
              lastName: profile.displayName?.split(" ").slice(1).join(" ") || "",
              profileImageUrl: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) {
            done(err, undefined);
          }
        }
      )
    );
    console.log("GitHub OAuth strategy configured");
  } else {
    console.log("GitHub OAuth: GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET not set - skipping");
  }

  // ============================================
  // FACEBOOK OAuth Strategy
  // ============================================
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/auth/facebook/callback",
          profileFields: ["id", "emails", "name", "picture.type(large)"],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const user = await findOrCreateOAuthUser({
              provider: "facebook",
              id: profile.id,
              email: profile.emails?.[0]?.value || "",
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
              profileImageUrl: profile.photos?.[0]?.value,
            });
            done(null, user);
          } catch (err) {
            done(err, undefined);
          }
        }
      )
    );
    console.log("Facebook OAuth strategy configured");
  } else {
    console.log("Facebook OAuth: FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not set - skipping");
  }

  // ============================================
  // AUTH ROUTES
  // ============================================

  // Get current user session
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user as any;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
        phone: user.phone,
        department: user.department,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Get available OAuth providers (so frontend knows which buttons to show)
  app.get("/api/auth/providers", (req, res) => {
    res.json({
      google: !!process.env.GOOGLE_CLIENT_ID,
      microsoft: !!process.env.MICROSOFT_CLIENT_ID,
      github: !!process.env.GITHUB_CLIENT_ID,
      facebook: !!process.env.FACEBOOK_APP_ID,
      local: true, // email/password always available
    });
  });

  // ---- EMAIL/PASSWORD AUTH ----

  // Register with email/password
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, companyName, companyRegistration, phone, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if email already exists
      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        passwordHash,
        firstName: firstName || email.split("@")[0],
        lastName: lastName || "",
        authProvider: "local",
        role: role || "viewer",
        phone,
        emailVerified: false,
      }).returning();

      // Also create registration record if company info provided
      if (companyName) {
        await db.insert(userRegistrations).values({
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          companyName,
          companyRegistration: companyRegistration || null,
          phone: phone || "",
          role: role || "admin",
          status: "approved", // auto-approve for now
        });
      }

      // Log the user in immediately
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }

        logAudit(newUser.id, "register", `New account created via email: ${email}`, req);

        res.json({
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          authProvider: "local",
        });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // Login with email/password
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user) {
        await logAudit(null, "login_failed", `No account found for email: ${email}`, req);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.passwordHash) {
        // User registered via OAuth, no password set
        return res.status(401).json({
          message: `This account uses ${user.authProvider} sign-in. Please use the ${user.authProvider} button instead.`
        });
      }

      // Verify password
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        await logAudit(user.id, "login_failed", `Invalid password attempt for: ${email}`, req);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Your account has been deactivated. Contact support." });
      }

      // Update last login
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        logAudit(user.id, "login", `Email/password login successful`, req);

        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          authProvider: user.authProvider,
          profileImageUrl: user.profileImageUrl,
        });
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    const user = req.user as any;
    if (user) {
      logAudit(user.id, "logout", "User logged out", req);
    }
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Also support GET logout for convenience
  app.get("/api/logout", (req, res) => {
    const user = req.user as any;
    if (user) {
      logAudit(user.id, "logout", "User logged out", req);
    }
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/login");
      });
    });
  });

  // ---- OAUTH ROUTES ----

  // Google
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  app.get("/api/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login?error=google_failed" }), (req, res) => {
    const user = req.user as any;
    if (user) logAudit(user.id, "login", "Google OAuth login", req);
    res.redirect("/");
  });

  // Microsoft
  app.get("/api/auth/microsoft", (req, res, next) => {
    if (!process.env.MICROSOFT_CLIENT_ID) return res.redirect("/login?error=microsoft_not_configured");
    passport.authenticate("microsoft", { scope: ["user.read"] })(req, res, next);
  });
  app.get("/api/auth/microsoft/callback", (req, res, next) => {
    passport.authenticate("microsoft", { failureRedirect: "/login?error=microsoft_failed" })(req, res, next);
  }, (req, res) => {
    const user = req.user as any;
    if (user) logAudit(user.id, "login", "Microsoft OAuth login", req);
    res.redirect("/");
  });

  // GitHub
  app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
  app.get("/api/auth/github/callback", passport.authenticate("github", { failureRedirect: "/login?error=github_failed" }), (req, res) => {
    const user = req.user as any;
    if (user) logAudit(user.id, "login", "GitHub OAuth login", req);
    res.redirect("/");
  });

  // Facebook
  app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
  app.get("/api/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login?error=facebook_failed" }), (req, res) => {
    const user = req.user as any;
    if (user) logAudit(user.id, "login", "Facebook OAuth login", req);
    res.redirect("/");
  });

  // ---- AUDIT TRAIL API ----

  // Log an audit event from frontend
  app.post("/api/auth/audit", async (req, res) => {
    try {
      const user = req.user as any;
      const { action, details } = req.body;

      await logAudit(user?.id || null, action || "unknown", details || "", req);
      res.json({ success: true });
    } catch (error) {
      console.error("Audit log error:", error);
      res.status(500).json({ error: "Failed to log audit event" });
    }
  });

  // Get audit trail (admin only)
  app.get("/api/auth/audit", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || (user.role !== "admin" && user.role !== "manager")) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const logs = await storage.getAuditLogs({
        limit: parseInt(req.query.limit as string) || 100,
        offset: parseInt(req.query.offset as string) || 0,
        userId: req.query.userId as string,
        action: req.query.action as string,
      });

      res.json(logs);
    } catch (error) {
      console.error("Audit fetch error:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Middleware to track page navigation (audit trail)
export function auditMiddleware(): RequestHandler {
  return async (req, res, next) => {
    // Only track page-related API calls and navigation
    const user = req.user as any;
    if (user && req.method === "GET" && req.path.startsWith("/api/") && !req.path.includes("/auth/")) {
      // Don't await - fire and forget for performance
      logAudit(user.id, "api_access", `${req.method} ${req.path}`, req).catch(() => {});
    }
    next();
  };
}
