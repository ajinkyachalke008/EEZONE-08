import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Gamification tables
export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  totalPoints: integer('total_points').notNull().default(0),
  level: text('level').notNull().default('Beginner'),
  quizzesCompleted: integer('quizzes_completed').notNull().default(0),
  questionsAsked: integer('questions_asked').notNull().default(0),
  answersAccepted: integer('answers_accepted').notNull().default(0),
  calculatorsUsed: integer('calculators_used').notNull().default(0),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastLoginDate: text('last_login_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  badgeId: text('badge_id').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  category: text('category').notNull(),
  requirementType: text('requirement_type').notNull(),
  requirementValue: integer('requirement_value').notNull(),
  createdAt: text('created_at').notNull(),
});

export const userBadges = sqliteTable('user_badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  badgeId: text('badge_id').notNull(),
  earnedAt: text('earned_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  achievementType: text('achievement_type').notNull(),
  pointsAwarded: integer('points_awarded').notNull(),
  metadata: text('metadata'),
  createdAt: text('created_at').notNull(),
});

export const leaderboardEntries = sqliteTable('leaderboard_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  totalPoints: integer('total_points').notNull(),
  level: text('level').notNull(),
  rank: integer('rank').notNull(),
  period: text('period').notNull(),
  category: text('category').notNull(),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Project builder tables
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  estimatedTime: text('estimated_time').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  status: text('status').notNull().default('draft'),
  viewsCount: integer('views_count').notNull().default(0),
  likesCount: integer('likes_count').notNull().default(0),
  ratingAverage: real('rating_average').notNull().default(0.0),
  ratingCount: integer('rating_count').notNull().default(0),
  tags: text('tags').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const projectSteps = sqliteTable('project_steps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  stepNumber: integer('step_number').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  instructions: text('instructions').notNull(),
  calculatorIds: text('calculator_ids'),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  estimatedDuration: text('estimated_duration'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const projectUploads = sqliteTable('project_uploads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  caption: text('caption'),
  createdAt: text('created_at').notNull(),
});

export const projectComments = sqliteTable('project_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  comment: text('comment').notNull(),
  parentCommentId: integer('parent_comment_id'),
  likesCount: integer('likes_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const projectRatings = sqliteTable('project_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  rating: integer('rating').notNull(),
  review: text('review'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add tutorials and learning resources tables
export const videoTutorials = sqliteTable('video_tutorials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  duration: text('duration').notNull(),
  views: integer('views').notNull().default(0),
  rating: real('rating').notNull().default(0.0),
  category: text('category').notNull(),
  level: text('level').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  videoUrl: text('video_url').notNull(),
  author: text('author').notNull(),
  tags: text('tags'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const downloadableResources = sqliteTable('downloadable_resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: text('file_size').notNull(),
  fileUrl: text('file_url').notNull(),
  downloads: integer('downloads').notNull().default(0),
  category: text('category').notNull(),
  tags: text('tags'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  readTime: integer('read_time').notNull(),
  category: text('category').notNull(),
  author: text('author').notNull(),
  authorAvatar: text('author_avatar'),
  institution: text('institution'),
  views: integer('views').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  thumbnailUrl: text('thumbnail_url'),
  tags: text('tags'),
  publishedAt: text('published_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Learning platform tables
export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  topicId: integer('topic_id').notNull().references(() => topics.id),
  difficulty: text('difficulty').notNull(),
  questionText: text('question_text').notNull(),
  optionA: text('option_a').notNull(),
  optionB: text('option_b').notNull(),
  optionC: text('option_c').notNull(),
  optionD: text('option_d').notNull(),
  correctOption: text('correct_option').notNull(),
  explanation: text('explanation').notNull(),
  createdAt: text('created_at').notNull(),
});

export const quizAttempts = sqliteTable('quiz_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  topicId: integer('topic_id').references(() => topics.id),
  score: integer('score').notNull().default(0),
  totalQuestions: integer('total_questions').notNull(),
  startedAt: text('started_at').notNull(),
  finishedAt: text('finished_at'),
});

export const questionAttempts = sqliteTable('question_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  attemptId: integer('attempt_id').notNull().references(() => quizAttempts.id),
  questionId: integer('question_id').notNull().references(() => questions.id),
  selectedOption: text('selected_option'),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
});

export const userTopicsProgress = sqliteTable('user_topics_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  topicId: integer('topic_id').notNull().references(() => topics.id),
  completionPercent: integer('completion_percent').notNull().default(0),
  sectionsCompleted: text('sections_completed').notNull().default('[]'),
  lastVisitedAt: text('last_visited_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  contentType: text('content_type').notNull(),
  contentId: integer('content_id').notNull(),
  createdAt: text('created_at').notNull(),
});