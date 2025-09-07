import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["student", "faculty", "admin"]);
export const achievementCategoryEnum = pgEnum("achievement_category", [
  "academic", "technical", "sports", "arts", "leadership", "volunteering", "internship", "placement"
]);
export const achievementStatusEnum = pgEnum("achievement_status", ["pending", "approved", "rejected"]);

export const users = pgTable("users", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievementLikes = pgTable("achievement_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievementComments = pgTable("achievement_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pointsConfig = pgTable("points_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: achievementCategoryEnum("category").notNull().unique(),
  points: integer("points").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  achievements: many(achievements),
  likes: many(achievementLikes),
  comments: many(achievementComments),
  validatedAchievements: many(achievements, { relationName: "validator" }),
}));

export const achievementsRelations = relations(achievements, ({ one, many }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
  validator: one(users, {
    fields: [achievements.validatedBy],
    references: [users.id],
    relationName: "validator",
  }),
  likes: many(achievementLikes),
  comments: many(achievementComments),
}));

export const achievementLikesRelations = relations(achievementLikes, ({ one }) => ({
  achievement: one(achievements, {
    fields: [achievementLikes.achievementId],
    references: [achievements.id],
  }),
  user: one(users, {
    fields: [achievementLikes.userId],
    references: [users.id],
  }),
}));

export const achievementCommentsRelations = relations(achievementComments, ({ one }) => ({
  achievement: one(achievements, {
    fields: [achievementComments.achievementId],
    references: [achievements.id],
  }),
  user: one(users, {
    fields: [achievementComments.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  totalPoints: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  userId: true,
  status: true,
  points: true,
  validatedBy: true,
  validatedAt: true,
  rejectionReason: true,
  createdAt: true,
});

export const insertPointsConfigSchema = createInsertSchema(pointsConfig).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type AchievementLike = typeof achievementLikes.$inferSelect;
export type AchievementComment = typeof achievementComments.$inferSelect;
export type PointsConfig = typeof pointsConfig.$inferSelect;
export type InsertPointsConfig = z.infer<typeof insertPointsConfigSchema>;
