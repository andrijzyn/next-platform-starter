import { z } from "zod";

// ── Products ────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  description: string | null;
}

export const insertProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
  price: z.number().min(0, "Price must be 0 or more"),
  lowStockThreshold: z.number().int().min(0).default(10),
  description: z.string().optional(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;

// ── Military ranks ──────────────────────────────────
export const MILITARY_RANKS = [
  "Солдат",
  "Старший солдат",
  "Молодший сержант",
  "Сержант",
  "Старший сержант",
  "Головний сержант",
  "Штаб-сержант",
  "Майстер-сержант",
  "Старший майстер-сержант",
  "Головний майстер-сержант",
  "Молодший лейтенант",
  "Лейтенант",
  "Старший лейтенант",
  "Капітан",
  "Майор",
  "Підполковник",
  "Полковник",
  "Бригадний генерал",
  "Генерал-майор",
  "Генерал-лейтенант",
  "Генерал",
] as const;

// ── Security clearance levels ───────────────────────
export const CLEARANCE_LEVELS = [
  "Без допуску",
  "Для службового користування",
  "Таємно",
  "Цілком таємно",
  "Особливої важливості",
] as const;

// ── User roles ──────────────────────────────────────
export const USER_ROLES = ["admin", "user"] as const;

// ── Users ───────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  rank: string;
  unit: string;
  callsign: string | null;
  clearanceLevel: string;
  role: string;
  isActive: boolean;
  createdAt: Date | null;
}

export type SafeUser = Omit<User, "password">;

export const insertUserSchema = z.object({
  username: z.string().min(3, "Логін має бути не менше 3 символів"),
  password: z.string().min(6, "Пароль має бути не менше 6 символів"),
  fullName: z.string().min(1, "ПІБ обов'язкове"),
  rank: z.string().min(1, "Звання обов'язкове"),
  unit: z.string().min(1, "Підрозділ обов'язковий"),
  callsign: z.string().optional(),
  clearanceLevel: z.enum(CLEARANCE_LEVELS).default("Без допуску"),
  role: z.enum(USER_ROLES).default("user"),
  isActive: z.boolean().default(true),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Введіть логін"),
  password: z.string().min(1, "Введіть пароль"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
