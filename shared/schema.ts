import { pgTable, text, uuid, timestamp, integer, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// جدول المستخدمين
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  avatar: text('avatar'),
  passwordHash: text('password_hash').notNull(),
  emailVerified: boolean('email_verified').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  status: text('status').notNull().default('active'), // active, inactive, suspended
  lastLogin: timestamp('last_login'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// جدول الأدوار
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // admin, moderator, trader, viewer
  displayName: text('display_name').notNull(),
  description: text('description'),
  level: integer('level').notNull().default(100), // 0=admin, 1=mod, 2=trader, 3=viewer
  permissions: jsonb('permissions').notNull().default([]),
  isSystemRole: boolean('is_system_role').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// جدول ربط المستخدمين بالأدوار
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedBy: uuid('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at')
});

// جدول الإشارات
export const signals = pgTable('signals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text('symbol').notNull(), // EUR/USD, GBP/USD, etc.
  direction: text('direction').notNull(), // BUY, SELL
  entryPrice: decimal('entry_price', { precision: 10, scale: 5 }).notNull(),
  targetPrice: decimal('target_price', { precision: 10, scale: 5 }).notNull(),
  stopLoss: decimal('stop_loss', { precision: 10, scale: 5 }).notNull(),
  exitPrice: decimal('exit_price', { precision: 10, scale: 5 }),
  confidenceScore: integer('confidence_score').notNull(), // 0-100
  riskLevel: text('risk_level').notNull(), // low, medium, high
  timeframe: text('timeframe').notNull(), // 15m, 1h, 4h, 1d
  strategyName: text('strategy_name').notNull(),
  signalType: text('signal_type').notNull().default('technical'), // technical, ai, combined
  status: text('status').notNull().default('pending'), // pending, active, success, failed
  profitLoss: decimal('profit_loss', { precision: 10, scale: 2 }),
  profitLossPercentage: decimal('profit_loss_percentage', { precision: 5, scale: 2 }),
  technicalAnalysis: jsonb('technical_analysis').default({}),
  aiAnalysis: jsonb('ai_analysis').default({}),
  reasoning: jsonb('reasoning').default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  closedAt: timestamp('closed_at')
});

// جدول التنبيهات
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // signal, system, account, admin
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  isImportant: boolean('is_important').default(false),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  readAt: timestamp('read_at')
});

// جدول التحليلات والإحصائيات
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull(), // total_signals, success_rate, profit_loss, etc.
  value: decimal('value', { precision: 15, scale: 5 }).notNull(),
  period: text('period').notNull(), // daily, weekly, monthly, yearly
  date: timestamp('date').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// جدول الجلسات (للأمان المتقدم)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  lastActivity: timestamp('last_activity').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Zod schemas للتحقق من البيانات

// مخططات الإدراج
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true
});

// أنواع البيانات للاستخدام في TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type UserRole = typeof userRoles.$inferSelect;

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Session = typeof sessions.$inferSelect;

// مخططات التحقق الإضافية
export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"]
});

export const signalGenerationSchema = z.object({
  symbol: z.string().min(1, 'رمز العملة مطلوب'),
  timeframe: z.enum(['15m', '1h', '4h', '1d'], { message: 'الإطار الزمني غير صحيح' }),
  riskLevel: z.enum(['low', 'medium', 'high'], { message: 'مستوى المخاطرة غير صحيح' }),
  strategy: z.enum(['technical', 'ai', 'combined'], { message: 'الاستراتيجية غير صحيحة' })
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().optional(),
  country: z.string().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"]
});