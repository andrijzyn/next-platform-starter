import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { loginSchema } from "@/lib/schema";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Невірні дані для входу" }, { status: 400 });
    }

    const user = await storage.getUserByUsername(parsed.data.username);
    if (!user) {
      return NextResponse.json({ message: "Невірний логін або пароль" }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ message: "Акаунт деактивовано" }, { status: 401 });
    }

    const valid = await storage.validatePassword(user, parsed.data.password);
    if (!valid) {
      return NextResponse.json({ message: "Невірний логін або пароль" }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;

    const session = await getSession();
    session.user = safeUser;
    await session.save();

    return NextResponse.json(safeUser);
  } catch {
    return NextResponse.json({ message: "Помилка сервера" }, { status: 500 });
  }
}
