import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { getCurrentUser, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  const categories = await storage.getCategories();
  return NextResponse.json(categories);
}
