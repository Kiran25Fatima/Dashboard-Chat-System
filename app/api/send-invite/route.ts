import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, invitedBy, invitedByName } = await req.json();

    const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

    // Generate unique token
    const token = crypto.randomUUID();

    // Save invitation in DB
    const { error: dbError } = await supabase.from("invitations").insert({
      invited_by: invitedBy,
      email: email,
      token: token,
      status: "pending",
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Send invite email
    const { error: emailError } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
    subject: `${invitedByName} invited you to Conversa!`,
html: `
  <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
    <h2>Welcome to Conversa! 👋</h2>
    <p><strong>${invitedByName}</strong> has invited you to join Conversa.</p>
    <p>Click below to create your account:</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/signup?invite=${token}"
       style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px;">
      Join Conversa
    </a>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
      If you did not expect this invitation, you can ignore this email.
    </p>
  </div>
`,
    });

    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}