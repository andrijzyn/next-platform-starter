import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertUserSchema } from "@/lib/schema";
import { getCurrentUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (user.role !== "admin") return forbiddenResponse();

  const users = await storage.getUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();
  if (user.role !== "admin") return forbiddenResponse();

  try {
    const body = await req.json();
    const parsed = insertUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Помилка валідації", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await storage.getUserByUsername(parsed.data.username);
    if (existing) {
      return NextResponse.json(
        { message: "Користувач з таким логіном вже існує" },
        { status: 409 }
      );
    }

    const newUser = await storage.createUser(parsed.data);
    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
