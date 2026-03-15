import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertProductSchema } from "@/lib/schema";
import { getCurrentUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const product = await storage.getProduct(id);
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  try {
    const body = await req.json();
    const partial = insertProductSchema.partial().safeParse(body);
    if (!partial.success) {
      return NextResponse.json(
        { message: "Validation error", errors: partial.error.flatten() },
        { status: 400 }
      );
    }

    if (partial.data.sku) {
      const existing = await storage.getProductBySku(partial.data.sku);
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { message: "A product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    const product = await storage.updateProduct(id, partial.data);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  const { id } = await params;
  const deleted = await storage.deleteProduct(id);
  if (!deleted) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Product deleted" });
}
