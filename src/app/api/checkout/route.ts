import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();

  if (!["pro", "team"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const checkoutSession = await createCheckoutSession(
    session.user.id,
    session.user.email,
    plan,
    `${process.env.AUTH_URL}/dashboard?success=true`,
    `${process.env.AUTH_URL}/pricing`
  );

  return NextResponse.json({ url: checkoutSession.url });
}
