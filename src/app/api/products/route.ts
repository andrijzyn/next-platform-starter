import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertProductSchema } from "@/lib/schema";
import { getCurrentUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  const url = new URL(req.url);
  const query = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "";

  const products = await storage.searchProducts(query, category);
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = insertProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await storage.getProductBySku(parsed.data.sku);
    if (existing) {
      return NextResponse.json(
        { message: "A product with this SKU already exists" },
        { status: 409 }
      );
    }

    const product = await storage.createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
