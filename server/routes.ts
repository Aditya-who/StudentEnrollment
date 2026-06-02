import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAchievementSchema } from "@shared/schema";

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

export function registerRoutes(app: Express): Server {
  // Authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }, express.static(uploadDir));

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const { status, category, userId } = req.query;
      const achievements = await storage.getAchievements(
        userId as string,
        status as string
      );
      
      // Get additional data for each achievement
      const achievementsWithData = await Promise.all(
        achievements.map(async (achievement) => {
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

  app.post("/api/achievements", upload.single("certificate"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      
      // Add certificate URL if file was uploaded
      if (req.file) {
        achievementData.certificateUrl = `/uploads/${req.file.filename}`;
      }

      const achievement = await storage.createAchievement(achievementData, req.user!.id);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create achievement" });
    }
  });

  app.patch("/api/achievements/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { id } = req.params;
      const achievement = await storage.getAchievement(id);
      
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }

      // Only faculty/admin can approve/reject, or owner can edit pending
      if (achievement.status !== "pending" && req.user!.role === "student") {
        return res.status(403).json({ message: "Cannot modify approved/rejected achievement" });
      }

      if (["approved", "rejected"].includes(req.body.status) && !["faculty", "admin"].includes(req.user!.role)) {
        return res.status(403).json({ message: "Only faculty can approve/reject achievements" });
      }

      const updates: any = { ...req.body };
      
      // If approving, assign points and update user total
      if (req.body.status === "approved" && achievement.status === "pending") {
        const pointsConfigs = await storage.getPointsConfig();
        const categoryConfig = pointsConfigs.find(c => c.category === achievement.category);
        const points = categoryConfig?.points || getDefaultPoints(achievement.category);
        
        updates.points = points;
        updates.validatedBy = req.user!.id;
        updates.validatedAt = new Date();
        
        await storage.updateUserPoints(achievement.userId, points);
      }

      const updatedAchievement = await storage.updateAchievement(id, updates);
      res.json(updatedAchievement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update achievement" });
    }
  });

  // Achievement interactions
  app.post("/api/achievements/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await storage.likeAchievement(req.params.id, req.user!.id);
      res.status(200).json({ message: "Achievement liked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to like achievement" });
    }
  });

  app.delete("/api/achievements/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await storage.unlikeAchievement(req.params.id, req.user!.id);
      res.status(200).json({ message: "Achievement unliked" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike achievement" });
    }
  });

  app.post("/api/achievements/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { content } = req.body;
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      const comment = await storage.addComment(req.params.id, req.user!.id, content);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { category, limit } = req.query;
      const leaderboard = await storage.getLeaderboard(
        category as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Points configuration (admin only)
  app.get("/api/points-config", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const config = await storage.getPointsConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch points config" });
    }
  });

  app.patch("/api/points-config/:category", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== "admin") {
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

  const httpServer = createServer(app);
  return httpServer;
}

function getDefaultPoints(category: string): number {
  const defaults: Record<string, number> = {
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
