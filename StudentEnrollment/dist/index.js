var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievementCategoryEnum: () => achievementCategoryEnum,
  achievementComments: () => achievementComments,
  achievementCommentsRelations: () => achievementCommentsRelations,
  achievementLikes: () => achievementLikes,
  achievementLikesRelations: () => achievementLikesRelations,
  achievementStatusEnum: () => achievementStatusEnum,
  achievements: () => achievements,
  achievementsRelations: () => achievementsRelations,
  insertAchievementSchema: () => insertAchievementSchema,
  insertPointsConfigSchema: () => insertPointsConfigSchema,
  insertUserSchema: () => insertUserSchema,
  pointsConfig: () => pointsConfig,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum = pgEnum("user_role", ["student", "faculty", "admin"]);
var achievementCategoryEnum = pgEnum("achievement_category", [
  "academic",
  "technical",
  "sports",
  "arts",
  "leadership",
  "volunteering",
  "internship",
  "placement"
]);
var achievementStatusEnum = pgEnum("achievement_status", ["pending", "approved", "rejected"]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  department: text("department"),
  year: text("year"),
  rollNo: text("roll_no"),
  designation: text("designation"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  totalPoints: integer("total_points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: achievementCategoryEnum("category").notNull(),
  date: timestamp("date").notNull(),
  issuingAuthority: text("issuing_authority").notNull(),
  certificateUrl: text("certificate_url"),
  status: achievementStatusEnum("status").notNull().default("pending"),
  points: integer("points").notNull().default(0),
  validatedBy: varchar("validated_by").references(() => users.id),
  validatedAt: timestamp("validated_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var achievementLikes = pgTable("achievement_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var achievementComments = pgTable("achievement_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var pointsConfig = pgTable("points_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: achievementCategoryEnum("category").notNull().unique(),
  points: integer("points").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var usersRelations = relations(users, ({ many }) => ({
  achievements: many(achievements),
  likes: many(achievementLikes),
  comments: many(achievementComments),
  validatedAchievements: many(achievements, { relationName: "validator" })
}));
var achievementsRelations = relations(achievements, ({ one, many }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id]
  }),
  validator: one(users, {
    fields: [achievements.validatedBy],
    references: [users.id],
    relationName: "validator"
  }),
  likes: many(achievementLikes),
  comments: many(achievementComments)
}));
var achievementLikesRelations = relations(achievementLikes, ({ one }) => ({
  achievement: one(achievements, {
    fields: [achievementLikes.achievementId],
    references: [achievements.id]
  }),
  user: one(users, {
    fields: [achievementLikes.userId],
    references: [users.id]
  })
}));
var achievementCommentsRelations = relations(achievementComments, ({ one }) => ({
  achievement: one(achievements, {
    fields: [achievementComments.achievementId],
    references: [achievements.id]
  }),
  user: one(users, {
    fields: [achievementComments.userId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalPoints: true,
  createdAt: true
});
var insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  userId: true,
  status: true,
  points: true,
  validatedBy: true,
  validatedAt: true,
  rejectionReason: true,
  createdAt: true
});
var insertPointsConfigSchema = createInsertSchema(pointsConfig).omit({
  id: true,
  updatedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, sql as sql2, and, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
  async getAchievement(id) {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement || void 0;
  }
  async getAchievements(userId, status) {
    let query = db.select().from(achievements);
    const conditions = [];
    if (userId) conditions.push(eq(achievements.userId, userId));
    if (status) conditions.push(eq(achievements.status, status));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return await query.orderBy(desc(achievements.createdAt));
  }
  async createAchievement(achievement, userId) {
    const [newAchievement] = await db.insert(achievements).values({ ...achievement, userId }).returning();
    return newAchievement;
  }
  async updateAchievement(id, updates) {
    const [achievement] = await db.update(achievements).set(updates).where(eq(achievements.id, id)).returning();
    return achievement;
  }
  async deleteAchievement(id) {
    await db.delete(achievements).where(eq(achievements.id, id));
  }
  async likeAchievement(achievementId, userId) {
    await db.insert(achievementLikes).values({ achievementId, userId });
  }
  async unlikeAchievement(achievementId, userId) {
    await db.delete(achievementLikes).where(
      and(
        eq(achievementLikes.achievementId, achievementId),
        eq(achievementLikes.userId, userId)
      )
    );
  }
  async addComment(achievementId, userId, content) {
    const [comment] = await db.insert(achievementComments).values({ achievementId, userId, content }).returning();
    return comment;
  }
  async getAchievementLikes(achievementId) {
    const [result] = await db.select({ count: count() }).from(achievementLikes).where(eq(achievementLikes.achievementId, achievementId));
    return result.count;
  }
  async getAchievementComments(achievementId) {
    return await db.select().from(achievementComments).where(eq(achievementComments.achievementId, achievementId)).orderBy(desc(achievementComments.createdAt));
  }
  async getLeaderboard(category, limit = 10) {
    let query = db.select().from(users);
    if (category) {
      query = db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        department: users.department,
        year: users.year,
        rollNo: users.rollNo,
        designation: users.designation,
        bio: users.bio,
        profileImage: users.profileImage,
        linkedinUrl: users.linkedinUrl,
        githubUrl: users.githubUrl,
        totalPoints: sql2`sum(${achievements.points})`.as("totalPoints"),
        createdAt: users.createdAt,
        password: users.password
      }).from(users).leftJoin(achievements, and(
        eq(achievements.userId, users.id),
        eq(achievements.status, "approved"),
        eq(achievements.category, category)
      )).groupBy(users.id).orderBy(desc(sql2`sum(${achievements.points})`));
    } else {
      query = query.orderBy(desc(users.totalPoints));
    }
    return await query.limit(limit);
  }
  async updateUserPoints(userId, points) {
    await db.update(users).set({ totalPoints: sql2`${users.totalPoints} + ${points}` }).where(eq(users.id, userId));
  }
  async getPointsConfig() {
    return await db.select().from(pointsConfig);
  }
  async updatePointsConfig(category, points) {
    const [config] = await db.insert(pointsConfig).values({ category, points }).onConflictDoUpdate({
      target: pointsConfig.category,
      set: { points, updatedAt: sql2`now()` }
    }).returning();
    return config;
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !await comparePasswords(password, user.password)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }
    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password)
    });
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/routes.ts
var uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"));
    }
  }
});
function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/uploads", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }, express.static(uploadDir));
  app2.get("/api/achievements", async (req, res) => {
    try {
      const { status, category, userId } = req.query;
      const achievements2 = await storage.getAchievements(
        userId,
        status
      );
      const achievementsWithData = await Promise.all(
        achievements2.map(async (achievement) => {
          const [user, likesCount, comments] = await Promise.all([
            storage.getUser(achievement.userId),
            storage.getAchievementLikes(achievement.id),
            storage.getAchievementComments(achievement.id)
          ]);
          return {
            ...achievement,
            user: user ? { id: user.id, name: user.name, department: user.department } : null,
            likesCount,
            commentsCount: comments.length
          };
        })
      );
      res.json(achievementsWithData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  app2.post("/api/achievements", upload.single("certificate"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      if (req.file) {
        achievementData.certificateUrl = `/uploads/${req.file.filename}`;
      }
      const achievement = await storage.createAchievement(achievementData, req.user.id);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });
  app2.patch("/api/achievements/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { id } = req.params;
      const achievement = await storage.getAchievement(id);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      if (achievement.status !== "pending" && req.user.role === "student") {
        return res.status(403).json({ message: "Cannot modify approved/rejected achievement" });
      }
      if (["approved", "rejected"].includes(req.body.status) && !["faculty", "admin"].includes(req.user.role)) {
        return res.status(403).json({ message: "Only faculty can approve/reject achievements" });
      }
      const updates = { ...req.body };
      if (req.body.status === "approved" && achievement.status === "pending") {
        const pointsConfigs = await storage.getPointsConfig();
        const categoryConfig = pointsConfigs.find((c) => c.category === achievement.category);
        const points = categoryConfig?.points || getDefaultPoints(achievement.category);
        updates.points = points;
        updates.validatedBy = req.user.id;
        updates.validatedAt = /* @__PURE__ */ new Date();
        await storage.updateUserPoints(achievement.userId, points);
      }
      const updatedAchievement = await storage.updateAchievement(id, updates);
      res.json(updatedAchievement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update achievement" });
    }
  });
  app2.post("/api/achievements/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      await storage.likeAchievement(req.params.id, req.user.id);
      res.status(200).json({ message: "Achievement liked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to like achievement" });
    }
  });
  app2.delete("/api/achievements/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      await storage.unlikeAchievement(req.params.id, req.user.id);
      res.status(200).json({ message: "Achievement unliked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike achievement" });
    }
  });
  app2.post("/api/achievements/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const { content } = req.body;
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }
      const comment = await storage.addComment(req.params.id, req.user.id, content);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    try {
      const { category, limit } = req.query;
      const leaderboard = await storage.getLeaderboard(
        category,
        limit ? parseInt(limit) : void 0
      );
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/points-config", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const config = await storage.getPointsConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch points config" });
    }
  });
  app2.patch("/api/points-config/:category", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const { category } = req.params;
      const { points } = req.body;
      if (!points || points < 0) {
        return res.status(400).json({ message: "Valid points value required" });
      }
      const config = await storage.updatePointsConfig(category, points);
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to update points config" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
function getDefaultPoints(category) {
  const defaults = {
    technical: 50,
    academic: 40,
    sports: 30,
    arts: 25,
    leadership: 35,
    volunteering: 20,
    internship: 45,
    placement: 60
  };
  return defaults[category] || 25;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
