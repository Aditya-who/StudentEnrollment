import { 
  users, 
  achievements, 
  achievementLikes, 
  achievementComments, 
  pointsConfig,
  type User, 
  type InsertUser,
  type Achievement,
  type InsertAchievement,
  type AchievementLike,
  type AchievementComment,
  type PointsConfig,
  type InsertPointsConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Achievement methods
  getAchievement(id: string): Promise<Achievement | undefined>;
  getAchievements(userId?: string, status?: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement, userId: string): Promise<Achievement>;
  updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement>;
  deleteAchievement(id: string): Promise<void>;
  
  // Achievement interaction methods
  likeAchievement(achievementId: string, userId: string): Promise<void>;
  unlikeAchievement(achievementId: string, userId: string): Promise<void>;
  addComment(achievementId: string, userId: string, content: string): Promise<AchievementComment>;
  getAchievementLikes(achievementId: string): Promise<number>;
  getAchievementComments(achievementId: string): Promise<AchievementComment[]>;
  
  // Leaderboard methods
  getLeaderboard(category?: string, limit?: number): Promise<User[]>;
  updateUserPoints(userId: string, points: number): Promise<void>;
  
  // Points config methods
  getPointsConfig(): Promise<PointsConfig[]>;
  updatePointsConfig(category: string, points: number): Promise<PointsConfig>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement || undefined;
  }

  async getAchievements(userId?: string, status?: string): Promise<Achievement[]> {
    let query = db.select().from(achievements);
    
    const conditions = [];
    if (userId) conditions.push(eq(achievements.userId, userId));
    if (status) conditions.push(eq(achievements.status, status as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(achievements.createdAt));
  }

  async createAchievement(achievement: InsertAchievement, userId: string): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values({ ...achievement, userId })
      .returning();
    return newAchievement;
  }

  async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement> {
    const [achievement] = await db
      .update(achievements)
      .set(updates)
      .where(eq(achievements.id, id))
      .returning();
    return achievement;
  }

  async deleteAchievement(id: string): Promise<void> {
    await db.delete(achievements).where(eq(achievements.id, id));
  }

  async likeAchievement(achievementId: string, userId: string): Promise<void> {
    await db.insert(achievementLikes).values({ achievementId, userId });
  }

  async unlikeAchievement(achievementId: string, userId: string): Promise<void> {
    await db
      .delete(achievementLikes)
      .where(
        and(
          eq(achievementLikes.achievementId, achievementId),
          eq(achievementLikes.userId, userId)
        )
      );
  }

  async addComment(achievementId: string, userId: string, content: string): Promise<AchievementComment> {
    const [comment] = await db
      .insert(achievementComments)
      .values({ achievementId, userId, content })
      .returning();
    return comment;
  }

  async getAchievementLikes(achievementId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(achievementLikes)
      .where(eq(achievementLikes.achievementId, achievementId));
    return result.count;
  }

  async getAchievementComments(achievementId: string): Promise<AchievementComment[]> {
    return await db
      .select()
      .from(achievementComments)
      .where(eq(achievementComments.achievementId, achievementId))
      .orderBy(desc(achievementComments.createdAt));
  }

  async getLeaderboard(category?: string, limit = 10): Promise<User[]> {
    let query = db.select().from(users);
    
    if (category) {
      // Get users with achievements in specific category
      query = db
        .select({
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
          totalPoints: sql<number>`sum(${achievements.points})`.as('totalPoints'),
          createdAt: users.createdAt,
          password: users.password,
        })
        .from(users)
        .leftJoin(achievements, and(
          eq(achievements.userId, users.id),
          eq(achievements.status, "approved"),
          eq(achievements.category, category as any)
        ))
        .groupBy(users.id)
        .orderBy(desc(sql`sum(${achievements.points})`));
    } else {
      query = query.orderBy(desc(users.totalPoints));
    }
    
    return await query.limit(limit);
  }

  async updateUserPoints(userId: string, points: number): Promise<void> {
    await db
      .update(users)
      .set({ totalPoints: sql`${users.totalPoints} + ${points}` })
      .where(eq(users.id, userId));
  }

  async getPointsConfig(): Promise<PointsConfig[]> {
    return await db.select().from(pointsConfig);
  }

  async updatePointsConfig(category: string, points: number): Promise<PointsConfig> {
    const [config] = await db
      .insert(pointsConfig)
      .values({ category: category as any, points })
      .onConflictDoUpdate({
        target: pointsConfig.category,
        set: { points, updatedAt: sql`now()` }
      })
      .returning();
    return config;
  }
}

export const storage = new DatabaseStorage();
