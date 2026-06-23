import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { token, newUserId, firstName, lastName } = await req.json();
    
    console.log("✅ process-invite called:", { token, newUserId });

    const { data: invitation, error: invErr } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .maybeSingle();

    console.log("✅ invitation found:", invitation);
    console.log("❌ invitation error:", invErr);

    if (!invitation) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await supabase.from("conversations").insert({
      user1_id: invitation.invited_by,
      user2_id: newUserId,
      updated_at: new Date().toISOString(),
    });

    await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("token", token);

    await supabase.from("notifications").insert({
      user_id: invitation.invited_by,
      message: `${firstName} ${lastName} has accepted your invite and joined Conversa!`,
      type: "invite_accepted",
      is_read: false,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}