import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { Product, InsertProduct, User, InsertUser, SafeUser } from "./schema";

function toSafeUser(user: User): SafeUser {
  const { password, ...safe } = user;
  return safe;
}

class MemStorage {
  private products: Map<string, Product>;
  private users: Map<string, User>;

  constructor() {
    this.products = new Map();
    this.users = new Map();
    this.seed();
  }

  private seed() {
    const samples: InsertProduct[] = [
      { name: "Wireless Mouse", sku: "WM-001", category: "Electronics", quantity: 45, price: 29.99, lowStockThreshold: 10, description: "Ergonomic wireless mouse with USB receiver" },
      { name: "Mechanical Keyboard", sku: "MK-002", category: "Electronics", quantity: 8, price: 89.99, lowStockThreshold: 10, description: "Cherry MX Blue switches, full-size" },
      { name: "USB-C Cable 2m", sku: "UC-003", category: "Accessories", quantity: 150, price: 12.99, lowStockThreshold: 20, description: "Braided USB-C to USB-C cable" },
      { name: "Monitor Stand", sku: "MS-004", category: "Furniture", quantity: 3, price: 49.99, lowStockThreshold: 5, description: "Adjustable aluminum monitor stand" },
      { name: 'Laptop Sleeve 15"', sku: "LS-005", category: "Accessories", quantity: 0, price: 24.99, lowStockThreshold: 10, description: "Neoprene laptop sleeve for 15-inch laptops" },
      { name: "Webcam HD 1080p", sku: "WC-006", category: "Electronics", quantity: 22, price: 59.99, lowStockThreshold: 10, description: "Full HD webcam with built-in microphone" },
      { name: "Desk Lamp LED", sku: "DL-007", category: "Furniture", quantity: 5, price: 34.99, lowStockThreshold: 8, description: "Dimmable LED desk lamp with USB charging port" },
      { name: "HDMI Cable 3m", sku: "HC-008", category: "Accessories", quantity: 80, price: 9.99, lowStockThreshold: 15, description: "High-speed HDMI 2.1 cable" },
      { name: "Headphone Stand", sku: "HS-009", category: "Furniture", quantity: 12, price: 19.99, lowStockThreshold: 5, description: "Aluminum headphone stand" },
      { name: "Wireless Charger", sku: "WCH-010", category: "Electronics", quantity: 0, price: 39.99, lowStockThreshold: 10, description: "15W fast wireless charger pad" },
    ];

    for (const product of samples) {
      const id = randomUUID();
      this.products.set(id, { ...product, id, description: product.description ?? null });
    }

    const adminId = randomUUID();
    const adminHash = bcrypt.hashSync("admin123", 10);
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      password: adminHash,
      fullName: "Адміністратор системи",
      rank: "Полковник",
      unit: "Штаб",
      callsign: "КОРОНА",
      clearanceLevel: "Особливої важливості",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    });
  }

  // ── Products ────────────────────────────────────
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find((p) => p.sku === sku);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id, description: insertProduct.description ?? null };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated: Product = { ...existing, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async searchProducts(query: string, category?: string): Promise<Product[]> {
    let results = Array.from(this.products.values());
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (category && category !== "all") {
      results = results.filter((p) => p.category === category);
    }
    return results;
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    for (const product of this.products.values()) {
      categories.add(product.category);
    }
    return Array.from(categories).sort();
  }

  async getStats() {
    const products = Array.from(this.products.values());
    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
      lowStockCount: products.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length,
      outOfStockCount: products.filter((p) => p.quantity === 0).length,
      categoriesCount: new Set(products.map((p) => p.category)).size,
    };
  }

  // ── Users ───────────────────────────────────────
  async getUsers(): Promise<SafeUser[]> {
    return Array.from(this.users.values()).map(toSafeUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<SafeUser> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      username: insertUser.username,
      password: hashedPassword,
      fullName: insertUser.fullName,
      rank: insertUser.rank,
      unit: insertUser.unit,
      callsign: insertUser.callsign ?? null,
      clearanceLevel: insertUser.clearanceLevel ?? "Без допуску",
      role: insertUser.role ?? "user",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return toSafeUser(user);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<SafeUser | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;

    const patched: User = { ...existing };
    if (updates.username !== undefined) patched.username = updates.username;
    if (updates.fullName !== undefined) patched.fullName = updates.fullName;
    if (updates.rank !== undefined) patched.rank = updates.rank;
    if (updates.unit !== undefined) patched.unit = updates.unit;
    if (updates.callsign !== undefined) patched.callsign = updates.callsign ?? null;
    if (updates.clearanceLevel !== undefined) patched.clearanceLevel = updates.clearanceLevel;
    if (updates.role !== undefined) patched.role = updates.role;
    if (updates.isActive !== undefined) patched.isActive = updates.isActive;
    if (updates.password !== undefined) {
      patched.password = await bcrypt.hash(updates.password, 10);
    }

    this.users.set(id, patched);
    return toSafeUser(patched);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}

// Singleton — Note: In serverless (Netlify), this resets on cold starts
export const storage = new MemStorage();
