import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Gamification tables
export const userPoints = sqliteTable('user_points', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  totalPoints: integer('total_points').notNull().default(0),
  level: text('level').notNull().default('Beginner'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userActivities = sqliteTable('user_activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  activityType: text('activity_type').notNull(),
  pointsEarned: integer('points_earned').notNull(),
  metadata: text('metadata'),
  createdAt: text('created_at').notNull(),
});

export const userBadgesNew = sqliteTable('user_badges_new', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  badgeId: text('badge_id').notNull(),
  badgeName: text('badge_name').notNull(),
  badgeDescription: text('badge_description').notNull(),
  earnedAt: text('earned_at').notNull(),
});

export const dailyLoginStreaks = sqliteTable('daily_login_streaks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastLoginDate: text('last_login_date'),
  updatedAt: text('updated_at').notNull(),
});

// Project builder tables
export const projectsNew = sqliteTable('projects_new', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  imageUrl: text('image_url'),
  views: integer('views').notNull().default(0),
  featured: integer('featured').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const projectStepsNew = sqliteTable('project_steps_new', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull(),
  stepNumber: integer('step_number').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  calculatorLink: text('calculator_link'),
  createdAt: text('created_at').notNull(),
});

export const projectRatingsNew = sqliteTable('project_ratings_new', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull(),
  userId: text('user_id').notNull(),
  rating: integer('rating').notNull(),
  createdAt: text('created_at').notNull(),
});

export const projectCommentsNew = sqliteTable('project_comments_new', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull(),
  userId: text('user_id').notNull(),
  comment: text('comment').notNull(),
  createdAt: text('created_at').notNull(),
});