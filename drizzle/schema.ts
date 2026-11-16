import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 128 }).primaryKey(),
  index: varchar("index", { length: 8 }).notNull(),
  label: varchar("label", { length: 80 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  tag: varchar("tag", { length: 255 }).notNull(),
  description: text("description").notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  year: varchar("year", { length: 12 }).notNull(),
  duration: int("duration"),
  video: text("video").notNull(),
  coverImage: text("coverImage"),
  template: varchar("template", { length: 40 }).notNull().default("cinematic"),
  pageURL: text("pageURL"),
  featured: int("featured").default(0).notNull(),
  published: int("published").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const homepageSettings = mysqlTable("homepageSettings", {
  id: int("id").primaryKey(),
  backgroundVideo: text("backgroundVideo").notNull(),
  liveFrameBackgroundVideo: text("liveFrameBackgroundVideo").notNull(),
  aboutImage: text("aboutImage").notNull(),
  featuredProjectId: varchar("featuredProjectId", { length: 128 }).notNull(),
  reelProjectIds: text("reelProjectIds").notNull(),
  flowProjectIds: text("flowProjectIds").notNull(),
  reelVideoUrls: text("reelVideoUrls").notNull(),
  flowVideoUrls: text("flowVideoUrls").notNull(),
  slideKicker: varchar("slideKicker", { length: 120 }).notNull(),
  slideItems: text("slideItems").notNull(),
  aboutEyebrow: varchar("aboutEyebrow", { length: 160 }).notNull(),
  aboutStamp: varchar("aboutStamp", { length: 160 }).notNull(),
  aboutHeadline: text("aboutHeadline").notNull(),
  aboutBody: text("aboutBody").notNull(),
  aboutSmall: text("aboutSmall").notNull(),
  aboutSignature: text("aboutSignature").notNull(),
  aboutPortfolio: text("aboutPortfolio").notNull(),
  aboutFooterLeft: varchar("aboutFooterLeft", { length: 160 }).notNull(),
  aboutFooterHeadline: varchar("aboutFooterHeadline", { length: 255 }).notNull(),
  aboutFooterRight: varchar("aboutFooterRight", { length: 160 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectFrames = mysqlTable("projectFrames", {
  id: varchar("id", { length: 128 }).primaryKey(),
  projectId: varchar("projectId", { length: 128 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  mediaType: varchar("mediaType", { length: 16 }).notNull(),
  src: text("src").notNull(),
  caption: varchar("caption", { length: 255 }).notNull(),
  body: text("body").notNull(),
  layout: varchar("layout", { length: 32 }).notNull().default("wide"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type HomepageSettings = typeof homepageSettings.$inferSelect;
export type InsertHomepageSettings = typeof homepageSettings.$inferInsert;
export type ProjectFrame = typeof projectFrames.$inferSelect;
export type InsertProjectFrame = typeof projectFrames.$inferInsert;
