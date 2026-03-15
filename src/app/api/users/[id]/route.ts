import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertUserSchema } from "@/lib/schema";
import { getCurrentUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (user.role !== "admin") return forbiddenResponse();

  const { id } = await params;
  try {
    const body = await req.json();
    const partial = insertUserSchema.partial().safeParse(body);
    if (!partial.success) {
      return NextResponse.json(
        { message: "Помилка валідації", errors: partial.error.flatten() },
        { status: 400 }
      );
    }

    if (partial.data.username) {
      const existing = await storage.getUserByUsername(partial.data.username);
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { message: "Користувач з таким логіном вже існує" },
          { status: 409 }
        );
      }
    }

    const updated = await storage.updateUser(id, partial.data);
    if (!updated) {
      return NextResponse.json({ message: "Користувача не знайдено" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (user.role !== "admin") return forbiddenResponse();

  const { id } = await params;

  // Prevent self-delete
  if (user.id === id) {
    return NextResponse.json(
      { message: "Не можна видалити власний акаунт" },
      { status: 400 }
    );
  }

  const deleted = await storage.deleteUser(id);
  if (!deleted) {
    return NextResponse.json({ message: "Користувача не знайдено" }, { status: 404 });
  }
  return NextResponse.json({ message: "Користувача видалено" });
}
