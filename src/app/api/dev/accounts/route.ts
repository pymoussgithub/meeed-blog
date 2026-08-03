import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { isDevAccountSwitcherEnabled } from "@/lib/dev-mode";
import { getAllUsers } from "@/lib/services/user.service";

export async function GET() {
  if (!isDevAccountSwitcherEnabled()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [user, users] = await Promise.all([getCurrentUser(), getAllUsers()]);

  return NextResponse.json({
    currentUserId: user?.id ?? null,
    accounts: users
      .filter((account) => account.isActive)
      .map((account) => ({
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
      })),
  });
}
